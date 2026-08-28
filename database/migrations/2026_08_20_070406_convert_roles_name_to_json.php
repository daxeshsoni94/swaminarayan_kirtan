<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Temporarily change to text so existing values can be converted
        Schema::table('users', function (Blueprint $table) {
            $table->text('name')->nullable()->change();
        });

        // Convert existing names to JSON.
        // Existing name becomes the English value.
        DB::table('users')
            ->whereNotNull('name')
            ->get()
            ->each(function ($user) {

                // Don't convert again if it is already JSON
                $decoded = json_decode($user->name, true);

                if (is_array($decoded)) {
                    return;
                }

                DB::table('users')
                    ->where('id', $user->id)
                    ->update([
                        'name' => json_encode([
                            'en' => $user->name,
                            'gu' => '',
                        ], JSON_UNESCAPED_UNICODE),
                    ]);
            });

        // Finally change the column to JSON
        Schema::table('users', function (Blueprint $table) {
            $table->json('name')->nullable(false)->change();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->text('name')->change();
        });

        DB::table('users')
            ->whereNotNull('name')
            ->get()
            ->each(function ($user) {

                $name = json_decode($user->name, true);

                DB::table('users')
                    ->where('id', $user->id)
                    ->update([
                        'name' => is_array($name)
                            ? ($name['en'] ?? '')
                            : $user->name,
                    ]);
            });
    }
};