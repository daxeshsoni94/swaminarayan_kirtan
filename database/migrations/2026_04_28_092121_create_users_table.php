<?php

use App\Models\User;
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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('role_id')->constrained('roles')->cascadeOnDelete();
            $table->foreignId('language_id')->constrained('languages')->cascadeOnDelete();

            $table->json('name');
            $table->string('email')->unique();
            $table->string('phone', 20)->nullable();
            $table->string('password');

            // Status ENUM
            $table->enum('status', ['blocked', 'unblocked'])->default('unblocked');

            $table->string('profile')->nullable();

            // UI Settings
            $table->enum('theme_mode', ['dark', 'light', 'system'])->default('system');
            $table->integer('text_size')->default(14);


            // Email Verification
            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
