<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;

function userUpdatePayload(User $user, array $overrides = []): array
{
    return array_merge([
        'name' => $user->name,
        'surname' => $user->surname,
        'email' => $user->email,
        'role_id' => $user->role_id,
        'is_approved' => true,
        'is_active' => true,
    ], $overrides);
}

// Portier zmienia dane użytkownika
test('manager can update user data', function () {
    $student = makeStudent();

    Sanctum::actingAs(makeManager());

    $response = $this->putJson("/api/users/{$student->id}", userUpdatePayload($student, [
        'name' => 'Piotr',
        'surname' => 'Nowak',
    ]));

    $response->assertStatus(200)->assertJson(['name' => 'Piotr', 'surname' => 'Nowak']);
    $this->assertDatabaseHas('users', ['id' => $student->id, 'name' => 'Piotr', 'surname' => 'Nowak']);
});

// E-mail zajęty przez innego użytkownika
test('user cannot be updated to an already used email', function () {
    makeStudent('first@example.com');
    $second = makeStudent('second@example.com');

    Sanctum::actingAs(makeManager());

    $response = $this->putJson("/api/users/{$second->id}", userUpdatePayload($second, [
        'email' => 'first@example.com',
    ]));

    $response->assertStatus(422)->assertJsonValidationErrors(['email']);
    $this->assertDatabaseHas('users', ['id' => $second->id, 'email' => 'second@example.com']);
});

// Brak hasła w żądaniu nie zmienia starego
test('update without password keeps the old password', function () {
    $student = makeStudent();

    Sanctum::actingAs(makeManager());

    $this->putJson("/api/users/{$student->id}", userUpdatePayload($student))->assertStatus(200);

    expect(Hash::check('password123', User::find($student->id)->password))->toBeTrue();
});
