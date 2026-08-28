<?php

namespace App\Console\Commands;

use App\Models\Pad;
use Exception;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ConvertPadTitleToTranslatable extends Command
{
    /**
     * The name and signature of the console command.
     *
     */
    protected $signature = 'pads:convert-title-to-translatable';
    protected $description = 'Safely convert pads.title column to JSON and make it translatable';

    /**
     * The console command description.
     * Execute the console command.
     */
    public function handle()
    {
        // Step 1: Make every title a valid JSON string
        DB::table('pads')->orderBy('id')->chunkById(100, function ($pads) {
            foreach ($pads as $pad) {
                $title = $pad->title;

                // Skip if already looks like JSON
                if ($title === null || $title === '') {
                    continue;
                }

                $trimmed = trim($title);

                if (!str_starts_with($trimmed, '{') && !str_starts_with($trimmed, '"') && !str_starts_with($trimmed, '[')) {
                    $jsonTitle = json_encode($title, JSON_UNESCAPED_UNICODE);

                    DB::table('pads')
                        ->where('id', $pad->id)
                        ->update(['title' => $jsonTitle]);
                }
            }
        });

        $this->info('Step 1 completed.');

        // Step 2: Change column type to JSON
        $this->info('Step 2/3: Changing column type to JSON...');

        try {
            Schema::table('pads', function ($table) {
                $table->json('title')->nullable()->change();
            });
            $this->info('Column type changed successfully.');
        } catch (Exception $e) {
            $this->error('Failed to change column type: ' . $e->getMessage());
            return 1;
        }

        // Step 3: Convert JSON strings into proper translation format {"en": "..."}
        $this->info('Step 3/3: Converting to translatable format {"en": "..."}...');

        Pad::chunkById(100, function ($pads) {
            foreach ($pads as $pad) {
                $raw = $pad->getRawOriginal('title');

                if (empty($raw)) {
                    continue;
                }

                // Case 1: still a plain JSON string → "Some Title"
                if (is_string($raw) && str_starts_with(trim($raw), '"')) {
                    $english = json_decode($raw);
                    if ($english) {
                        $pad->setTranslation('title', 'en', $english);
                        $pad->save();
                    }
                }
                // Case 2: already an object but missing structure
                elseif (is_array($raw) || (is_string($raw) && str_starts_with(trim($raw), '{'))) {
                    // already good or will be handled by Spatie
                }
            }
        });

        $this->info('All done! pads.title is now fully translatable.');
        $this->info('You can now use: $pad->setTranslation("title", "gu", "ગુજરાતી ટાઇટલ")');

        return 0;
    }
}
