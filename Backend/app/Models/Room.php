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
        'entry_time',
        'user_id',
    ];

    protected $casts = [
        'has_piano' => 'boolean',
        'is_open' => 'boolean',
    ];
}
