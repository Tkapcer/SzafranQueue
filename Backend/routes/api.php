<?php

use App\Http\Controllers\ApiAuthController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\RoomOccupancyController;
use App\Http\Controllers\UserController;
use App\Http\Middleware\EnsureUserIsManager; // <-- KLUCZOWY IMPORT!
use Illuminate\Support\Facades\Route;

// Trasy publiczne (nie wymagają tokenu)
Route::post('/login', [ApiAuthController::class, 'login']);
Route::get('/roles', [ApiAuthController::class, 'roles']);
Route::post('/register', [ApiAuthController::class, 'register']);

// Trasy chronione (wymagają tokenu w nagłówku)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [ApiAuthController::class, 'logout']);
    Route::post('/rooms/{room}/heartbeat', [RoomOccupancyController::class, 'heartbeat']);

    // Odczyt sal (dla każdego zalogowanego)
    Route::get('/rooms', [RoomController::class, 'index']);
    Route::get('/rooms/{room}', [RoomController::class, 'show']);

    // Akcje użytkownika w sali
    Route::post('/rooms/{room}/occupy', [RoomOccupancyController::class, 'occupy']);
    Route::post('/rooms/{room}/leave', [RoomOccupancyController::class, 'leave']);

    // Tylko dla Portiera / Managera (role_id === 1)
    Route::middleware(EnsureUserIsManager::class)->group(function () {
        Route::post('/rooms', [RoomController::class, 'store']);
        Route::put('/rooms/{room}', [RoomController::class, 'update']);
        Route::delete('/rooms/{room}', [RoomController::class, 'destroy']);

        // Pełny CRUD użytkowników (index, store, show, update, destroy) wewnątrz managera
        Route::apiResource('users', UserController::class);
    });
});

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'message' => 'Backend Laravel działa poprawnie!'
    ]);
});
