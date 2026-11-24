<?php

use App\Models\User;
use Laravel\Sanctum\Sanctum;

// Integracyjny: rejestracja -> próba logowania (odrzucona) -> zatwierdzenie przez managera -> logowanie i wylogowanie
test('user lifecycle: register pending -> login blocked -> approved by manager -> login and logout', function () {
    $payload = registrationPayload([
        'name' => 'Anna',
        'surname' => 'Nowak',
        'email' => 'anna.nowak@example.com',
        'password' => 'TajneHaslo123!',
    ]);

    // 1. Rejestracja nowego konta (niezatwierdzonego)
    $this->postJson('/api/register', $payload)
        ->assertStatus(201);

    $createdUser = User::where('email', 'anna.nowak@example.com')->firstOrFail();
    expect($createdUser->is_approved)->toBeFalse();

    // 2. Logowanie przed zatwierdzeniem przez managera powinno być odrzucone
    $this->postJson('/api/login', [
        'email' => 'anna.nowak@example.com',
        'password' => 'TajneHaslo123!',
    ])->assertStatus(403);

    // 3. Manager zatwierdza i aktywuje użytkownika
    $manager = makeManager();
    Sanctum::actingAs($manager);

    $this->putJson("/api/users/{$createdUser->id}", [
        'name' => $createdUser->name,
        'surname' => $createdUser->surname,
        'email' => $createdUser->email,
        'role_id' => $createdUser->role_id,
        'is_approved' => true,
        'is_active' => true,
    ])->assertStatus(200);

    $this->assertDatabaseHas('users', [
        'id' => $createdUser->id,
        'is_approved' => true,
        'is_active' => true,
    ]);

    // 4. Po zatwierdzeniu logowanie działa i zwraca token
    $loginResponse = $this->postJson('/api/login', [
        'email' => 'anna.nowak@example.com',
        'password' => 'TajneHaslo123!',
    ])->assertStatus(200);

    $token = $loginResponse->json('token');
    expect($token)->not->toBeEmpty();

    // 5. Wylogowanie na zalogowanym użytkowniku kończy się sukcesem
    $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson('/api/logout')
        ->assertStatus(200);
});