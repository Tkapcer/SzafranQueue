<?php

use Laravel\Sanctum\Sanctum;

// Integracyjny: student A zajmuje -> wykładowca wyprasza -> student B dostaje 409 -> wykładowca zwalnia -> student B zajmuje
test('lecturer can take over a room from student A and student B can occupy it only after lecturer leaves', function () {
    $studentA = makeStudent('studentA@example.com');
    $studentB = makeStudent('studentB@example.com');
    $lecturer = makeLecturer();
    $room = makeRoom();

    // 1. student A zajmuje salę
    Sanctum::actingAs($studentA);
    $this->postJson("/api/rooms/{$room->id}/occupy")->assertStatus(200);
    $this->assertDatabaseHas('room', [
        'id' => $room->id,
        'status' => 'occupied',
        'user_id' => $studentA->id,
    ]);

    // 2. wykładowca wyprasza studenta A z sali (przejmuje salę)
    Sanctum::actingAs($lecturer);
    $this->postJson("/api/rooms/{$room->id}/occupy")->assertStatus(200);
    $this->assertDatabaseHas('room', [
        'id' => $room->id,
        'status' => 'occupied',
        'user_id' => $lecturer->id,
    ]);

    // 3. student B próbuje zająć tę samą salę (nie może, bo jest zajęta przez wykładowcę)
    Sanctum::actingAs($studentB);
    $this->postJson("/api/rooms/{$room->id}/occupy")->assertStatus(409);
    $this->assertDatabaseHas('room', [
        'id' => $room->id,
        'status' => 'occupied',
        'user_id' => $lecturer->id,
    ]);

    // 4. wykładowca zwalnia salę
    Sanctum::actingAs($lecturer);
    $this->postJson("/api/rooms/{$room->id}/leave")->assertStatus(200);
    $this->assertDatabaseHas('room', [
        'id' => $room->id,
        'status' => 'free',
        'user_id' => null,
    ]);

    // 5. student B zajmuje wolną salę
    Sanctum::actingAs($studentB);
    $this->postJson("/api/rooms/{$room->id}/occupy")->assertStatus(200);
    $this->assertDatabaseHas('room', [
        'id' => $room->id,
        'status' => 'occupied',
        'user_id' => $studentB->id,
    ]);
});
