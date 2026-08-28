<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Pad_media;

class Kirtan extends Model
{
    protected $fillable = [
        'title',
        'status',
        'created_by'
    ];

    // Kirtan has many Pads
    public function pads()
    {
        return $this->hasMany(Pad::class);
    }
    // public function recordedVersion()
    // {
    //     return $this->hasOne(Pad_media::class);
    // }
}
