<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->text('name')->nullable()->change();
        });

        DB::table('users')->whereNotNull('name')->get()->each(function ($user) {
            DB::table('users')
                ->where('id', $user->id)
                ->update([
                    'name' => json_encode([
                        'en' => $user->name,
                    ], JSON_UNESCAPED_UNICODE),
                ]);
        });
        // Now change the column to JSON
        Schema::table('users', function (Blueprint $table) {
            $table->json('name')->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            //
        });
    }
};
