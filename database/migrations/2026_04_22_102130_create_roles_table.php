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
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->json('name')->unique();
            $table->timestamp('created_at')->useCurrent();
            $table->string('guard_name')->default('web');   // ← Added
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
            $table->unique(['name', 'guard_name']);        // Spatie requires this
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};
