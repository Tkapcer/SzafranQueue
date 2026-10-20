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
            ['name' => 'manager'],
            ['name' => 'student'],
            ['name' => 'lecturer'],
        ]);

        User::create([
            'name' => 'Admin',
            'surname' => 'User',
            'email' => 'account@example.com',
            'password' => bcrypt('password'),
            'roleId' => Role::where('name', 'manager')->first()->id,
            'isApproved' => true,
        ]);
    }
}