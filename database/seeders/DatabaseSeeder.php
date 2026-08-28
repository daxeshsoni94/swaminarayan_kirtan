<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(PermissionSeeder::class);
        // \App\Models\User::factory(10)->create();

        // \App\Models\User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',   
        // ]);
        DB::table('roles')->insert([
            ['name' => 'Admin'],
            ['name' => 'User']
        ]);

        DB::table('languages')->insert([

            [
                'code' => 'en',
                'name' => 'English',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'hi',
                'name' => 'Hindi',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
