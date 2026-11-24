<?php

use Laravel\Sanctum\Sanctum;

// Sprawdzanie, że wykładowca wyprzedza studenta w kolejce i dostaje ofertę sali jako pierwszy
test('lecturer gets room offer ahead of an earlier waiting student', function () {
    $student = makeStudent('waiting-student@example.com');
    $lecturer = makeLecturer();
    $room = makeRoom(['is_open' => true, 'status' => 'free', 'has_piano' => true]);

    // 1. Student wchodzi do kolejki jako pierwszy
    Sanctum::actingAs($student);
    $this->postJson('/api/queue/join', ['requires_piano' => true])->assertStatus(201);

    // 2. Wykładowca wchodzi do kolejki później
    Sanctum::actingAs($lecturer);
    $this->postJson('/api/queue/join', ['requires_piano' => true])->assertStatus(201);

    // 3. Wykładowca sprawdza status -> dostaje ofertę sali (status pokoju -> pending)
    $lecturerStatus = $this->getJson('/api/queue/status')
        ->assertStatus(200)
        ->json();

    expect($lecturerStatus['offered_room']['id'] ?? null)->toBe($room->id);
    $this->assertDatabaseHas('room', ['id' => $room->id, 'status' => 'pending']);

    // 4. Student sprawdza status -> nie dostaje tej samej oferty, bo wyprzedza go wykładowca
    Sanctum::actingAs($student);
    $studentStatus = $this->getJson('/api/queue/status')
        ->assertStatus(200)
        ->json();

    expect($studentStatus['offered_room'])->toBeNull();

    // 5. Wykładowca akceptuje salę -> occupied przez wykładowcę i znika z kolejki
    Sanctum::actingAs($lecturer);
    $this->postJson('/api/queue/accept')->assertStatus(200);

    $this->assertDatabaseHas('room', [
        'id' => $room->id,
        'status' => 'occupied',
        'user_id' => $lecturer->id,
    ]);
    $this->assertDatabaseMissing('queue_entries', ['user_id' => $lecturer->id]);
});