<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Path extends Model
{
    protected $fillable = [
        'id_card_path',
        'user_id'
    ];

    public $timestamps = false;

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
