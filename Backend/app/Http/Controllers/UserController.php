<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    // Pobieranie listy użytkowników
    public function index()
    {
        return User::with('role')->get();
    }

    // Dodawanie nowego użytkownika
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'surname' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
            'role_id' => 'required|exists:roles,id',
            'is_approved' => 'required|boolean',
            'is_active' => 'required|boolean',
        ]);

        $user = User::create($validated);

        return response()->json($user->load('role'), 201);
    }

    // Pobieranie jednego użytkownika
    public function show(User $user)
    {
        return $user->load('role');
    }

    // Edycja użytkownika
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'surname' => 'required|string|max:255',
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'password' => 'nullable|string|min:8',
            'role_id' => 'required|exists:roles,id',
            'is_approved' => 'required|boolean',
            'is_active' => 'required|boolean',
        ]);

        // Jeśli hasło nie zostało podane, nie zmieniamy go
        if (empty($validated['password'])) {
            unset($validated['password']);
        }

        $user->update($validated);

        return response()->json($user->fresh()->load('role'));
    }

    // Usuwanie użytkownika
    public function destroy(User $user)
    {
        if ($user->role_id == 1) {
            return response()->json([
                'message' => 'Manager account cannot be deleted.'
            ], 403);
        }

        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully.'
        ]);
    }
}