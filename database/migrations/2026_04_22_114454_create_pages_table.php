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
        Schema::create('pages', function (Blueprint $table) {
            $table->id();
            $table->text('page_group');
            $table->text('title');
            $table->string('slug')->unique();
            $table->longText('content');

            // Status 
            $table->enum('status', ['published', 'draft'])->default('draft');


            // Created By (Admin/User)
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
        Schema::dropIfExists('pages');
    }
};
