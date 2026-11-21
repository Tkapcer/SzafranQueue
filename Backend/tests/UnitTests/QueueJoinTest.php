<?php

use App\Models\QueueEntry;
use Laravel\Sanctum\Sanctum;

// Student dołącza do kolejki
test('student can join the queue', function () {
    $student = makeStudent();

    Sanctum::actingAs($student);

    $response = $this->postJson('/api/queue/join', ['requires_piano' => false]);

    $response->assertStatus(201);
    $this->assertDatabaseHas('queue_entries', [
        'user_id' => $student->id,
        'status' => 'waiting',
        'requires_piano' => false,
    ]);
});

// Student ma niższy priorytet (2) niż wykładowca (1)
test('student gets priority level 2', function () {
    $student = makeStudent();

    Sanctum::actingAs($student);
    $this->postJson('/api/queue/join', ['requires_piano' => false]);

    expect(QueueEntry::where('user_id', $student->id)->first()->priority_level)->toBe(2);
});

test('lecturer gets priority level 1', function () {
    $lecturer = makeLecturer();

    Sanctum::actingAs($lecturer);
    $this->postJson('/api/queue/join', ['requires_piano' => false]);

    expect(QueueEntry::where('user_id', $lecturer->id)->first()->priority_level)->toBe(1);
});

// Ponowne dołączenie nie tworzy drugiego wpisu
test('joining the queue twice keeps a single entry', function () {
    $student = makeStudent();

    Sanctum::actingAs($student);
    $this->postJson('/api/queue/join', ['requires_piano' => false])->assertStatus(201);
    $this->postJson('/api/queue/join', ['requires_piano' => true])->assertStatus(201);

    $this->assertDatabaseCount('queue_entries', 1);
    $this->assertDatabaseHas('queue_entries', ['user_id' => $student->id, 'requires_piano' => true]);
});