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
        Schema::table('pads', function (Blueprint $table) {
            $table->dropForeign(['kirtan_id']); // Drop foreign key
            $table->dropColumn('kirtan_id');    // Then drop the column
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pads', function (Blueprint $table) {
            $table->foreignId('kirtan_id')
                  ->nullable()
                  ->constrained('kirtans')
                  ->nullOnDelete(); // or ->cascadeOnDelete() if that was the original behavior
        });
    }
};