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
        Schema::create('pad_media', function (Blueprint $table) {
            $table->id();

            // Foreign Key
            $table->foreignId('pad_id')->constrained('pads')->cascadeOnDelete();

            // Media Type
            $table->enum('media_type', ['audio', 'video']);

            // File
            $table->text('file_url');

            $table->text('singer')->nullable();
            $table->text('publisher')->nullable();
            $table->text('vocalization')->nullable();

            $table->enum('recording_type', ['live', 'studio'])->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pad_media');
    }
};
