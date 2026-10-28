<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Role;
use App\Models\User;

class RoleTableSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('role')->insert([
            ['name' => 'manager', 'alias' => 'Zarządca', 'isSelectable' => false],
            ['name' => 'student', 'alias' => 'Student', 'isSelectable' => true],
            ['name' => 'lecturer', 'alias' => 'Wykładowca', 'isSelectable' => true],
        ]);

        User::create([
            'name' => 'Admin',
            'surname' => 'Admin',
            'email' => 'account@example.com',
            'password' => bcrypt('Haslo1'),
            'roleId' => Role::where('name', 'manager')->first()->id,
            'isApproved' => true,
        ]);
    }
}
