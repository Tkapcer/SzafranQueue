<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Role;
use App\Models\User;

class RolesTableSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('roles')->insert([
            ['name' => 'manager', 'alias' => 'Zarządca', 'is_selectable' => false],
            ['name' => 'student', 'alias' => 'Student', 'is_selectable' => true],
            ['name' => 'lecturer', 'alias' => 'Wykładowca', 'is_selectable' => true],
        ]);

        User::create([
            'name' => 'Admin',
            'surname' => 'Admin',
            'email' => 'account@example.com',
            'password' => bcrypt('Haslo1'),
            'role_id' => Role::where('name', 'manager')->first()->id,
            'is_approved' => true,
        ]);
    }
}
