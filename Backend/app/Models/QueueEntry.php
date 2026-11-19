<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QueueEntry extends Model
{
    protected $table = 'queue_entries';

    protected $fillable = [
        'user_id',
        'requires_piano',
        'priority_level',
        'status',
        'offered_room_id',
    ];

    protected $casts = [
        'requires_piano' => 'boolean',
        'priority_level' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function offeredRoom(): BelongsTo
    {
        return $this->belongsTo(Room::class, 'offered_room_id');
    }
}