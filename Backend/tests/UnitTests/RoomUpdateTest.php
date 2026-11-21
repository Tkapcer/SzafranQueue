<?php

use Laravel\Sanctum\Sanctum;

// Portier zmienia dane sali
test('manager can update a room', function () {
    $room = makeRoom(['number' => '101', 'has_piano' => false]);

    Sanctum::actingAs(makeManager());

    $response = $this->putJson("/api/rooms/{$room->id}", [
        'number' => '102',
        'has_piano' => true,
        'is_open' => false,
    ]);

    $response->assertStatus(200)->assertJson(['number' => '102']);
    $this->assertDatabaseHas('room', [
        'id' => $room->id,
        'number' => '102',
        'has_piano' => true,
        'is_open' => false,
    ]);
});

// Zmiana numeru na już istniejący
test('room cannot be updated to a duplicate number', function () {
    makeRoom(['number' => '101']);
    $room = makeRoom(['number' => '102']);

    Sanctum::actingAs(makeManager());

    $response = $this->putJson("/api/rooms/{$room->id}", ['number' => '101']);

    $response->assertStatus(422)->assertJsonValidationErrors(['number']);
    $this->assertDatabaseHas('room', ['id' => $room->id, 'number' => '102']);
});
