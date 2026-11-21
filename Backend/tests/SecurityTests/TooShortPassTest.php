<?php

// Bezpieczeństwo: za krótkie hasło przy rejestracji
test('register rejects too short password', function () {
    $response = $this->postJson('/api/register', registrationPayload([
        'password' => 'short',
    ]));

    $response->assertStatus(422)->assertJsonValidationErrors(['password']);
    $this->assertDatabaseCount('users', 0);
});