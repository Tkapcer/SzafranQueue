<?php

use App\Models\Role;
use App\Models\User;

function createUser(array $overrides = []): User
{
    $role = Role::first() ?? Role::create([
        'name' => 'Student',
        'alias' => 'student',
    ]);

    return User::create(array_merge([
        'name' => 'Jan',
        'surname' => 'Kowalski',
        'email' => 'jan@example.com',
        'password' => 'password123',
        'role_id' => $role->id,
        'is_approved' => true,
        'is_active' => true,
    ], $overrides));
}

// Test 1: logowanie z poprawnymi danymi
test('login returns token for correct credentials', function () {
    createUser();

    $response = $this->postJson('/api/login', [
        'email' => 'jan@example.com',
        'password' => 'password123',
    ]);

    $response->assertStatus(200)->assertJsonStructure(['token', 'user']);
});

// Test 2: logowanie z niepoprawnym hasłem
test('login fails with wrong password', function () {
    createUser();

    $response = $this->postJson('/api/login', [
        'email' => 'jan@example.com',
        'password' => 'wrong-password',
    ]);

    $response->assertStatus(401)->assertJson(['message' => 'Invalid credentials.']);
});

// Test 3: logowanie przed zatwierdzeniem konta
test('login is rejected for account not approved', function () {
    createUser(['is_approved' => false]);

    $response = $this->postJson('/api/login', [
        'email' => 'jan@example.com',
        'password' => 'password123',
    ]);

    $response->assertStatus(403)->assertJsonMissing(['token']);
});

// Test 4: logowanie do nieaktywnego konta
test('login is rejected for inactive account', function () {
    createUser(['is_active' => false]);

    $response = $this->postJson('/api/login', [
        'email' => 'jan@example.com',
        'password' => 'password123',
    ]);

    $response->assertStatus(403)->assertJsonMissing(['token']);
});