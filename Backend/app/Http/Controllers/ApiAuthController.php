<?php

namespace App\Http\Controllers;

use App\Http\Requests\RegisterRequest;
use App\Http\Resources\RoleResource;
use App\Models\Path;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

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
                'message' => 'Invalid credentials.'
            ], 401);
        }

        // 4. Sprawdzenie, czy konto jest zatwierdzone (Twoja kolumna is_approved)
        if (!$user->is_approved) {
            return response()->json([
                'message' => 'Your account is pending approval by an administrator.'
            ], 403);
        }

        // 5. Sprawdzenie, czy konto jest aktywne (Twoja kolumna is_active)
        if (!$user->is_active) {
            return response()->json(['message' => 'Account is not active.'], 403);
        }

        // 6. Wygenerowanie tokena Sanctum
        $token = $user->createToken('mobile-device')->plainTextToken;

        // 7. Zwrócenie odpowiedzi dla React Native
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
            'message' => 'Logout successful'
        ]);
    }

    public function register(RegisterRequest $request)
    {
        $data = $request->validated();

        $uploadedFiles = [];

        DB::beginTransaction();

        try {
            $user = new User([
                'name' => $data['name'],
                'surname' => $data['surname'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
            ]);


            $user->role()->associate(Role::findOrFail($data['role_id']));

            $user->is_approved = false;
            $user->is_active = true;

            $user->save();

            if($request->hasFile('id_card_photo_front')) {
                $path = $request->file('id_card_photo_front')->store('id_card_photos');
                $uploadedFiles[] = $path;

                $user->paths()->create([
                    'id_card_path' => $path,
                ]);
            }

            if($request->hasFile('id_card_photo_back')) {
                $path = $request->file('id_card_photo_back')->store('id_card_photos');
                $uploadedFiles[] = $path;

                $user->paths()->create([
                    'id_card_path' => $path,
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Registration successful',
                'user' => $user
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            if (!empty($uploadedFiles)) {
                foreach ($uploadedFiles as $file) {
                    Storage::delete($file);
                }
            }

            return response()->json([
                'message' => 'Registration failed',
                'error' => $e->getMessage()     //Można by na produkcji usunąć zwracanie $e
            ], 500);
        }
    }

    public function roles(): AnonymousResourceCollection
    {
        return RoleResource::collection(
            Role::where('is_selectable', true)->get()
        );
    }
}
