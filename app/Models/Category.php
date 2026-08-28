<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

class Category extends Model
{
    use HasTranslations;
    public array $translatable = ['type', 'value'];

    protected $fillable = [
        'type',
        'value',
        'created_by',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
    // public function pads()
    // {
    //     return $this->belongsToMany(Pad::class);
    // }

    public function pads()
    {
        return $this->belongsToMany(
            Pad::class,
            'category_pad',   // pivot table name — change if yours is different
            'category_id',    // FK on pivot pointing to categories.id
            'pad_id'          // FK on pivot pointing to pads.id
        );
    }
}
