<?php

// Test endpointu
test('Endpoint returns status ok and code 200', function () {
    $response = $this->getJson('/api/health');

    $response->assertStatus(200);
    $response->assertJson([
        'status' => 'ok',
    ]);
});