<?php

use App\Http\Controllers\ApiAuthController;
use Illuminate\Support\Facades\Route;

// Trasy publiczne (nie wymagają tokenu)
Route::post('/login', [ApiAuthController::class, 'login']);
Route::get('/roles', [ApiAuthController::class, 'roles']);
Route::post('/register', [ApiAuthController::class, 'register']);

// Trasy chronione (wymagają tokenu w nagłówku)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [ApiAuthController::class, 'logout']);

    // Tutaj w przyszłości dodasz np. pobieranie profilu użytkownika:
    // Route::get('/user', function (Request $request) { return $request->user(); });
});

Route::get('/ping', function () {
    return response()->json([
        'status' => 'ok',
        'message' => 'Backend Laravel działa poprawnie!'
    ]);
});
