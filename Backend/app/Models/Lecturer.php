<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lecturer extends Model
{
    protected $table = 'lecturer';

    protected $fillable = [
        'user_id',
        'id_card_photo_path',
    ];
}
