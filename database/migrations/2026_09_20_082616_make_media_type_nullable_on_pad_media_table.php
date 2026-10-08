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
            // allow null
            $table->string('media_type')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pad_media', function (Blueprint $table) {
            // revert – put back NOT NULL (existing nulls will fail)
            $table->string('media_type')->nullable(false)->change();
        });
    }
};
