<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    protected $table = 'room';

    protected $fillable = [
        'number',
        'hasPiano',
        'isOpen',
        'entryTime',
        'accountId',
    ];
}
