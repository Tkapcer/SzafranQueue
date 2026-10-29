<?php

use App\Http\Controllers\ApiAuthController;
use App\Http\Controllers\RoomController;
use Illuminate\Support\Facades\Route;

// Trasy publiczne (nie wymagają tokenu)
Route::post('/login', [ApiAuthController::class, 'login']);
Route::get('/roles', [ApiAuthController::class, 'roles']);
Route::post('/register', [ApiAuthController::class, 'register']);

// Trasy chronione (wymagają tokenu w nagłówku)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [ApiAuthController::class, 'logout']);
    Route::apiResource('rooms', RoomController::class);
});

Route::get('/ping', function () {
    return response()->json([
        'status' => 'ok',
        'message' => 'Backend Laravel działa poprawnie!'
    ]);
});