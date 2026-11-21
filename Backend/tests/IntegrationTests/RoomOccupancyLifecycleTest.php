<?php

use Laravel\Sanctum\Sanctum;

// Integracyjny: occupy -> próba zajęcia przez innego -> leave -> occupy przez innego
test('room can be taken over by another student only after the first one leaves', function () {
    $first = makeStudent('first@example.com');
    $second = makeStudent('second@example.com');
    $room = makeRoom();

    // 1. pierwszy student zajmuje salę
    Sanctum::actingAs($first);
    $this->postJson("/api/rooms/{$room->id}/occupy")->assertStatus(200);
    $this->assertDatabaseHas('room', ['id' => $room->id, 'status' => 'occupied', 'user_id' => $first->id]);

    // 2. drugi student nie może jej zająć
    Sanctum::actingAs($second);
    $this->postJson("/api/rooms/{$room->id}/occupy")->assertStatus(409);
    $this->assertDatabaseHas('room', ['id' => $room->id, 'user_id' => $first->id]);

    // 3. pierwszy student zwalnia salę
    Sanctum::actingAs($first);
    $this->postJson("/api/rooms/{$room->id}/leave")->assertStatus(200);
    $this->assertDatabaseHas('room', ['id' => $room->id, 'status' => 'free', 'user_id' => null]);

    // 4. teraz drugi student może ją zająć
    Sanctum::actingAs($second);
    $this->postJson("/api/rooms/{$room->id}/occupy")->assertStatus(200);
    $this->assertDatabaseHas('room', ['id' => $room->id, 'status' => 'occupied', 'user_id' => $second->id]);
});