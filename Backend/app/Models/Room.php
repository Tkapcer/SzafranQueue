<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    protected $table = 'room';
    public $timestamps = false;

    protected $fillable = [
        'number',
        'has_piano',
        'is_open',
        'status',          // 'free' - dostępna, 'pending' - zaproponowana, oczekuje na potwierdzenie, 'occupied' - zajęta
        'user_id',         // ID osoby aktualnie ćwiczącej
        'entry_time',      // czas rozpoczęcia ćwiczeń
        'pending_user_id', // ID osoby, która ma ofertę wejścia
        'pending_until',   // czas wygaśnięcia oferty
        'last_heartbeat_at', // czas ostatniego sygnału aktywności
    ];

    protected $casts = [
        'has_piano' => 'boolean',
        'is_open' => 'boolean',
        'entry_time' => 'datetime',
        'pending_until' => 'datetime',
        'last_heartbeat_at' => 'datetime',
    ];

    public function currentUser()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function pendingUser()
    {
        return $this->belongsTo(User::class, 'pending_user_id');
    }
}