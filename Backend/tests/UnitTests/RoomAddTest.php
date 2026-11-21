<?php

use Laravel\Sanctum\Sanctum;

// Portier dodaje salę z poprawnymi danymi
test('manager can create a room', function () {
    Sanctum::actingAs(makeManager());

    $response = $this->postJson('/api/rooms', [
        'number' => '101',
        'has_piano' => true,
        'is_open' => true,
    ]);

    $response->assertStatus(201)->assertJson(['number' => '101']);
    $this->assertDatabaseHas('room', ['number' => '101', 'has_piano' => true]);
});

// Sala z numerem, który już istnieje
test('room cannot be created with duplicate number', function () {
    Sanctum::actingAs(makeManager());

    $this->postJson('/api/rooms', ['number' => '101'])->assertStatus(201);

    $response = $this->postJson('/api/rooms', ['number' => '101']);

    $response->assertStatus(422)->assertJsonValidationErrors(['number']);
    $this->assertDatabaseCount('room', 1);
});