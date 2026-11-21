<?php

use App\Models\User;
use Laravel\Sanctum\Sanctum;

// Portier zatwierdza oczekujące konto
test('manager can approve a pending user', function () {
    $pending = makeUser(2, 'pending@example.com', ['is_approved' => false]);

    Sanctum::actingAs(makeManager());

    $response = $this->postJson("/api/users/{$pending->id}/approve"); // dopasuj metodę i ścieżkę

    $response->assertStatus(200);
    expect(User::find($pending->id)->is_approved)->toBeTrue();
});
