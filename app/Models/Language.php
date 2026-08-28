<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Language extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
    ];

    

    /**
     * Get all users that belong to this language.
     */
    public function users()
    {
        return $this->hasMany(User::class);
    }
}
