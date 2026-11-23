<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Models\User;
// Dopasuj namespace, jeśli Twoje modele mają inne nazwy:
use App\Models\Room;

class E2ETestSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Upewnij się, że istnieją role
        $this->call([
            RolesTableSeeder::class,
        ]);

        // 2. Użytkownik testowy pasujący do api-connection.spec.ts
        User::create([
            'name' => 'Student',
            'surname' => 'Test',
            'email' => 'student@example.com',
            'password' => bcrypt('Haslo123!'),
            'role_id' => Role::where('name', 'student')->first()->id,
            'is_approved' => true,
            'is_active' => true,
        ]);

        // 3. Przykładowa sala
        Room::create([
            'number' => '101',
            'has_piano' => true,
            'is_open' => true,
            'status' => 'free',
        ]);

        $this->command?->info('E2ETestSeeder: utworzono student@example.com oraz sale 101.');
    }
}
