<?php

namespace App\Http\Controllers;

use App\Models\QueueEntry;
use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class QueueController extends Controller
{
    private function priorityForUser($user): int
    {
        return (int) $user->role_id === 3 ? 1 : 2;
    }

    private function findMatchingFreeRoom(bool $requiresPiano): ?Room
    {
        $query = Room::where('is_open', true)
            ->where('status', 'free')
            ->orderBy('id');

        if ($requiresPiano) {
            $query->where('has_piano', true);
        }

        return $query->first();
    }

    private function findNextEligibleEntryForRoom(Room $room): ?QueueEntry
    {
        return QueueEntry::where('status', 'waiting')
            ->where(function ($q) use ($room) {
                if (!$room->has_piano) {
                    $q->where('requires_piano', false);
                }
            })
            ->orderBy('priority_level', 'asc')
            ->orderBy('created_at', 'asc')
            ->first();
    }

    private function isUserFirstForRoom(QueueEntry $entry, Room $room): bool
    {
        $first = QueueEntry::where('status', 'waiting')
            ->where(function ($q) use ($room) {
                if (!$room->has_piano) {
                    $q->where('requires_piano', false);
                }
            })
            ->orderBy('priority_level', 'asc')
            ->orderBy('created_at', 'asc')
            ->first();

        return $first && $first->id === $entry->id;
    }

    public function join(Request $request)
    {
        $validated = $request->validate([
            'requires_piano' => 'required|boolean',
        ]);

        $user = $request->user();
        $priority = $this->priorityForUser($user);

        $entry = DB::transaction(function () use ($user, $validated, $priority) {
            $existing = QueueEntry::where('user_id', $user->id)->lockForUpdate()->first();

            if ($existing) {
                if ($existing->status === 'offered' && $existing->offered_room_id) {
                    Room::where('id', $existing->offered_room_id)
                        ->where('status', 'pending')
                        ->update(['status' => 'free']);
                }

                $existing->update([
                    'requires_piano' => $validated['requires_piano'],
                    'priority_level' => $priority,
                    'status' => 'waiting',
                    'offered_room_id' => null,
                    'created_at' => now(),
                ]);

                return $existing->fresh();
            }

            return QueueEntry::create([
                'user_id' => $user->id,
                'requires_piano' => $validated['requires_piano'],
                'priority_level' => $priority,
                'status' => 'waiting',
                'offered_room_id' => null,
            ]);
        });

        return response()->json([
            'entry' => $entry,
        ], 201);
    }

    public function status(Request $request)
    {
        $user = $request->user();

        $result = DB::transaction(function () use ($user) {
            $entry = QueueEntry::where('user_id', $user->id)->lockForUpdate()->first();

            if (!$entry) {
                return ['in_queue' => false, 'offered_room' => null, 'entry' => null];
            }

            // Jeśli ma już aktywną ofertę, sprawdź czy sala nadal jest pending
            if ($entry->status === 'offered' && $entry->offered_room_id) {
                $offeredRoom = Room::where('id', $entry->offered_room_id)->lockForUpdate()->first();
                if ($offeredRoom && $offeredRoom->status === 'pending') {
                    return [
                        'in_queue' => true,
                        'offered_room' => $offeredRoom,
                        'entry' => $entry,
                    ];
                }

                $entry->update(['status' => 'waiting', 'offered_room_id' => null]);
            }

            // Szukamy wolnej sali pasującej do wymogów użytkownika
            $freeRoom = Room::where('is_open', true)
                ->where('status', 'free')
                ->when($entry->requires_piano, fn ($q) => $q->where('has_piano', true))
                ->orderBy('id')
                ->lockForUpdate()
                ->first();

            if ($freeRoom && $this->isUserFirstForRoom($entry, $freeRoom)) {
                $freeRoom->update(['status' => 'pending']);
                $entry->update([
                    'status' => 'offered',
                    'offered_room_id' => $freeRoom->id,
                ]);

                return [
                    'in_queue' => true,
                    'offered_room' => $freeRoom->fresh(),
                    'entry' => $entry->fresh(),
                ];
            }

            return [
                'in_queue' => true,
                'offered_room' => null,
                'entry' => $entry->fresh(),
            ];
        });

        return response()->json($result);
    }

    public function accept(Request $request)
    {
        $user = $request->user();

        $room = DB::transaction(function () use ($user) {
            $entry = QueueEntry::where('user_id', $user->id)
                ->where('status', 'offered')
                ->lockForUpdate()
                ->first();

            if (!$entry || !$entry->offered_room_id) {
                return null;
            }

            $room = Room::where('id', $entry->offered_room_id)->lockForUpdate()->first();
            if (!$room || $room->status !== 'pending') {
                return null;
            }

            $room->update([
                'status' => 'occupied',
                'user_id' => $user->id,
                'entry_time' => now(),
                'last_heartbeat_at' => now(),
            ]);

            $entry->delete();

            return $room->fresh();
        });

        if (!$room) {
            return response()->json(['message' => 'Brak aktywnej oferty sali lub oferta wygasła.'], 422);
        }

        return response()->json([
            'message' => 'Zaakceptowano salę.',
            'room' => $room,
        ]);
    }

    public function reject(Request $request)
    {
        $user = $request->user();

        DB::transaction(function () use ($user) {
            $entry = QueueEntry::where('user_id', $user->id)->lockForUpdate()->first();
            if (!$entry) {
                return;
            }

            $roomId = $entry->offered_room_id;
            $entry->delete();

            if ($roomId) {
                $room = Room::where('id', $roomId)->lockForUpdate()->first();
                if ($room && $room->status === 'pending') {
                    $nextEntry = $this->findNextEligibleEntryForRoom($room);
                    if ($nextEntry) {
                        $room->update(['status' => 'pending']);
                        $nextEntry->update([
                            'status' => 'offered',
                            'offered_room_id' => $room->id,
                        ]);
                    } else {
                        $room->update(['status' => 'free']);
                    }
                }
            }
        });

        return response()->json(['message' => 'Odrzucono propozycję sali.']);
    }
}