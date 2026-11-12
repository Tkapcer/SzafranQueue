<?php

namespace App\Http\Controllers;

use App\Models\Room;
use Illuminate\Http\Request;

class RoomController extends Controller
{
    public function index(Request $request)
    {
        Room::where('status', 'occupied')
            ->where(function ($query) {
                // Brak pulsu od ponad 90 sekund
                $query->where('last_heartbeat_at', '<', now()->subSeconds(90))
                // LUB student przekroczył limit 2 godzin
                ->orWhere(function ($sub) {
                    $sub->whereHas('currentUser', fn($u) => $u->where('role_id', 2))
                        ->where('entry_time', '<', now()->subHours(2));
                });
            })
            ->update([
                'status' => 'free',
                'user_id' => null,
                'entry_time' => null,
                'last_heartbeat_at' => null,
            ]);
        $user = $request->user();

        // Jeśli użytkownik to portier (role_id === 1), zwracamy wszystkie sale
        if ($user && $user->role_id == 1) {
            return Room::all();
        }

        // Pozostali widzą tylko otwarte sale
        return Room::where('is_open', true)->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'number' => 'required|string|unique:room,number',
            'has_piano' => 'boolean',
            'is_open' => 'boolean',
        ]);

        $room = Room::create($validated);

        return response()->json($room, 201);
    }

    public function show(Room $room)
    {
        return $room;
    }

    public function update(Request $request, Room $room)
    {
        $validated = $request->validate([
            'number' => 'required|string|unique:room,number,' . $room->id,
            'has_piano' => 'boolean',
            'is_open' => 'boolean',
        ]);

        $room->update($validated);

        return response()->json($room);
    }

    public function destroy(Room $room)
    {
        $room->delete();

        return response()->json(['message' => 'Room deleted successfully']);
    }
}