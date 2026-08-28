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
        Schema::create('kirtans', function (Blueprint $table) {
            $table->id();
            $table->text('title')->nullable(); // Name of the Kirtan
            $table->enum('status', ['save', 'draft'])->default('draft');
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
        });
    }
             
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kirtans');
    }
};
