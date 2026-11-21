<?php

use Laravel\Sanctum\Sanctum;

// Student zajmuje wolną, otwartą salę
test('student can occupy a free open room', function () {
    $student = makeStudent();
    $room = makeRoom();

    Sanctum::actingAs($student);

    $response = $this->postJson("/api/rooms/{$room->id}/occupy");

    $response->assertStatus(200)->assertJson(['message' => 'Pomyślnie zajęto salę.']);
    $this->assertDatabaseHas('room', [
        'id' => $room->id,
        'status' => 'occupied',
        'user_id' => $student->id,
    ]);
});

// Student nie zajmie zamkniętej sali
test('student cannot occupy a closed room', function () {
    $student = makeStudent();
    $room = makeRoom(['is_open' => false]);

    Sanctum::actingAs($student);

    $response = $this->postJson("/api/rooms/{$room->id}/occupy");

    $response->assertStatus(409);
    $this->assertDatabaseHas('room', ['id' => $room->id, 'status' => 'free', 'user_id' => null]);
});