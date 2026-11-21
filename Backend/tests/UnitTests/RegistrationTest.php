<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

// Rejestracja z poprawnymi danymi
test('register creates user with correct data', function () {
    $response = $this->postJson('/api/register', registrationPayload());

    $response->assertStatus(201)->assertJson(['message' => 'Registration successful']);
    $this->assertDatabaseHas('users', ['email' => 'jan@example.com']);
});

// Nowe konto czeka na zatwierdzenie
test('registered user is not approved by default', function () {
    $this->postJson('/api/register', registrationPayload());

    $user = User::where('email', 'jan@example.com')->first();

    expect($user->is_approved)->toBeFalse();
});

// Błędny e-mail
test('register fails with invalid email', function () {
    $response = $this->postJson('/api/register', registrationPayload([
        'email' => 'not-an-email',
    ]));

    $response->assertStatus(422)->assertJsonValidationErrors(['email']);
    $this->assertDatabaseCount('users', 0);
});

// Zajęty e-mail
test('register fails with already used email', function () {
    $payload = registrationPayload();
    $this->postJson('/api/register', $payload)->assertStatus(201);

    $response = $this->postJson('/api/register', $payload);

    $response->assertStatus(422)->assertJsonValidationErrors(['email']);
    $this->assertDatabaseCount('users', 1);
});

// Przód zdjęciem bez tyłu jest odrzucany
test('register requires back photo when front is an image', function () {
    Storage::fake('local');

    $response = $this->withHeader('Accept', 'application/json')
        ->post('/api/register', registrationPayload([
            'id_card_photo_front' => UploadedFile::fake()->create('front.jpg', 100, 'image/jpeg'),
        ]));

    $response->assertStatus(422)->assertJsonValidationErrors(['id_card_photo_back']);
    $this->assertDatabaseCount('users', 0);
});