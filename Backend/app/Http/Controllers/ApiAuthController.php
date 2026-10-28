<?php

namespace App\Http\Controllers;

use App\Http\Requests\RegisterRequest;
use App\Http\Resources\RoleResource;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Hash;

class ApiAuthController extends Controller
{
    public function login(Request $request)
    {
        // 1. Walidacja danych wejściowych
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // 2. Wyszukanie użytkownika (pamiętaj, że model User korzysta u Ciebie z tabeli account)
        $user = User::where('email', $request->email)->first();

        // 3. Weryfikacja hasła (bcrypt)
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Nieprawidłowy adres email lub hasło.'
            ], 401);
        }

        // 4. Sprawdzenie, czy konto jest zatwierdzone (Twoja kolumna isApproved)
        if (!$user->isApproved) {
            return response()->json([
                'message' => 'Twoje konto oczekuje na zatwierdzenie przez administratora.'
            ], 403);
        }

        // 5. Wygenerowanie tokena Sanctum
        $token = $user->createToken('mobile-device')->plainTextToken;

        // 6. Zwrócenie odpowiedzi dla React Native
        return response()->json([
            'token' => $token,
            'user' => $user
        ]);
    }

    public function logout(Request $request)
    {
        // Revoke current token - unieważnia token, z którego przyszło zapytanie
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Wylogowano pomyślnie'
        ]);
    }

    public function register(RegisterRequest $request)
    {
        $data = $request->validated();

        $user = new User([
            'name' => $data['name'],
            'surname' => $data['surname'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        $user->role()->associate(Role::findOrFail($data['roleId']));
        $user->save();

        return response()->json([
            'message' => 'Rejestracja pomyślna',
            'user' => $user
        ], 201);
    }

    public function roles(): AnonymousResourceCollection
    {
        return RoleResource::collection(
            Role::where('isSelectable', true)->get()
        );
    }
}
