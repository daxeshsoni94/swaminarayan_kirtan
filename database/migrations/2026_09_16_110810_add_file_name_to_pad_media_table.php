<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('pad_media', function (Blueprint $table) {
            $table->json('file_name')->nullable()->after('file_url');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pad_media', function (Blueprint $table) {
            $table->dropColumn('file_name');
        });
    }
};
