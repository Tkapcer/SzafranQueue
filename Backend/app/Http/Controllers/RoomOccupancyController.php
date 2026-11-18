<?php

namespace App\Http\Controllers;

use App\Models\Room;
use Illuminate\Http\Request;

class RoomOccupancyController extends Controller
{             
    public function occupy(Request $request, Room $room)
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

        // Odśwież salę po czyszczeniu, bo $room mógł zostać zwolniony powyżej
        $room->refresh()->load('currentUser');

        $user = $request->user();

        $isFree = $room->status === 'free';
        $lecturerOverridesStudent = $user->role_id === 3
            && $room->status === 'occupied'
            && $room->currentUser?->role_id === 2;

        if (!$room->is_open || (!$isFree && !$lecturerOverridesStudent)) {
            return response()->json(['message' => 'Sala jest już zajęta lub zamknięta.'], 409);
        }

        $room->update([
            'status' => 'occupied',
            'user_id' => $user->id,
            'entry_time' => now(),
            'last_heartbeat_at' => now(),
            'pending_user_id' => null,
            'pending_until' => null,
        ]);

        return response()->json(['message' => 'Pomyślnie zajęto salę.', 'room' => $room]);
    }

    public function leave(Request $request, Room $room)
    {
        // Tylko osoba zajmująca salę lub manager może ją zwolnić
        if ($room->user_id !== $request->user()->id && $request->user()->role_id !== 1) {
            return response()->json(['message' => 'Brak uprawnień do zwolnienia tej sali.'], 403);
        }

        $room->update([
            'status' => 'free',
            'user_id' => null,
            'entry_time' => null,
        ]);

        return response()->json([
            'message' => 'Pomyślnie zwolniono salę.',
            'room' => $room
        ]);
    }

    public function heartbeat(Request $request, Room $room)
    {
        $user = $request->user();

        // Sprawdzamy czy to ten użytkownik faktycznie zajmuje salę
        if ($room->user_id !== $user->id || $room->status !== 'occupied') {
            return response()->json(['message' => 'Sesja nieaktywna.'], 403);
        }

        $room->update([
            'last_heartbeat_at' => now(),
        ]);

        return response()->json(['status' => 'alive']);
    }
}