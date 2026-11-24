<?php

use Laravel\Sanctum\Sanctum;

// Sprawdzenie, czy manager może tworzyć, zamykać i usuwać salę, a student nie może zajmować zamkniętej sali
test('manager can create, close and delete a room while student cannot occupy a closed room', function () {
    $manager = makeManager();
    $student = makeStudent();

    // 1. Manager dodaje nową salę
    Sanctum::actingAs($manager);
    $createResponse = $this->postJson('/api/rooms', [
        'number' => '205',
        'has_piano' => true,
        'is_open' => true,
        'status' => 'free',
    ])->assertStatus(201);

    $roomId = $createResponse->json('room.id') ?? $createResponse->json('id');
    $this->assertDatabaseHas('room', [
        'id' => $roomId,
        'number' => '205',
        'has_piano' => true,
        'is_open' => true,
    ]);

    // 2. Manager zamyka salę (is_open = false)
    $this->putJson("/api/rooms/{$roomId}", [
        'number' => '205',
        'has_piano' => true,
        'is_open' => false,
    ])->assertStatus(200);

    $this->assertDatabaseHas('room', [
        'id' => $roomId,
        'is_open' => false,
    ]);

    // 3. Student próbuje zająć zamkniętą salę -> brak możliwości zajęcia
    Sanctum::actingAs($student);
    $this->postJson("/api/rooms/{$roomId}/occupy")
        ->assertStatus(409);

    $this->assertDatabaseHas('room', [
        'id' => $roomId,
        'status' => 'free',
        'user_id' => null,
    ]);

    // 4. Manager usuwa salę
    Sanctum::actingAs($manager);
    $this->deleteJson("/api/rooms/{$roomId}")
        ->assertStatus(200);

    $this->assertDatabaseMissing('room', ['id' => $roomId]);
});

test('another student cannot leave occupied room, but manager can release it', function () {
    $studentA = makeStudent('a@example.com');
    $studentB = makeStudent('b@example.com');
    $manager = makeManager();
    $room = makeRoom();

    // 1. Student A zajmuje salę
    Sanctum::actingAs($studentA);
    $this->postJson("/api/rooms/{$room->id}/occupy")->assertStatus(200);

    // 2. Student B próbuje zwolnić salę studenta A -> 403
    Sanctum::actingAs($studentB);
    $this->postJson("/api/rooms/{$room->id}/leave")->assertStatus(403);

    $this->assertDatabaseHas('room', [
        'id' => $room->id,
        'status' => 'occupied',
        'user_id' => $studentA->id,
    ]);

    // 3. Manager zwalnia salę
    Sanctum::actingAs($manager);
    $this->postJson("/api/rooms/{$room->id}/leave")->assertStatus(200);

    $this->assertDatabaseHas('room', [
        'id' => $room->id,
        'status' => 'free',
        'user_id' => null,
    ]);
});