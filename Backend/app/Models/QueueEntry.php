<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QueueEntry extends Model
{
    protected $table = 'queue_entries';
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'requires_piano',
        'priority_level', // wykładowca - 1, wyproszony student - 2, student - 3
        'status',          // 'waiting' - czeka, 'offered' - ma salę, ale jeszcze nie wszedł, 'completed' - wyszedł
        'offered_at',        // czas, kiedy otrzymał ofertę wejścia
        'created_at',        // czas dodania do kolejki
    ];

    protected $casts = [
        'offered_at' => 'datetime',
        'created_at' => 'datetime',
        'requires_piano' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}