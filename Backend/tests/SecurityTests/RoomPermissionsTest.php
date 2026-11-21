<?php

use Laravel\Sanctum\Sanctum;

// Bezpieczeństwo: student nie może dodać sali
test('student cannot create a room', function () {
    Sanctum::actingAs(makeStudent());

    $response = $this->postJson('/api/rooms', [
        'number' => '101',
        'has_piano' => true,
        'is_open' => true,
    ]);

    $response->assertStatus(403);
    $this->assertDatabaseCount('room', 0);
});