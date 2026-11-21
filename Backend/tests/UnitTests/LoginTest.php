<?php

// Test 1: logowanie z poprawnymi danymi
test('login returns token for correct credentials', function () {
    makeUser(2, 'jan@example.com');

    $response = $this->postJson('/api/login', [
        'email' => 'jan@example.com',
        'password' => 'password123',
    ]);

    $response->assertStatus(200)->assertJsonStructure(['token', 'user']);
});

// Test 2: logowanie z niepoprawnym hasłem
test('login fails with wrong password', function () {
    makeUser(2, 'jan@example.com');

    $response = $this->postJson('/api/login', [
        'email' => 'jan@example.com',
        'password' => 'wrong-password',
    ]);

    $response->assertStatus(401)->assertJson(['message' => 'Invalid credentials.']);
});

// Test 3: logowanie przed zatwierdzeniem konta
test('login is rejected for account not approved', function () {
    makeUser(2, 'jan@example.com', ['is_approved' => false]);

    $response = $this->postJson('/api/login', [
        'email' => 'jan@example.com',
        'password' => 'password123',
    ]);

    $response->assertStatus(403)->assertJsonMissing(['token']);
});

// Test 4: logowanie do nieaktywnego konta
test('login is rejected for inactive account', function () {
    makeUser(2, 'jan@example.com', ['is_active' => false]);

    $response = $this->postJson('/api/login', [
        'email' => 'jan@example.com',
        'password' => 'password123',
    ]);

    $response->assertStatus(403)->assertJsonMissing(['token']);
});