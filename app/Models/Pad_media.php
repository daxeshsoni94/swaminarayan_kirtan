<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

class Pad_media extends Model
{
    use HasTranslations;
    protected $table = 'pad_media';

    public array $translatable = [
        'file_name',
        'singer',
        'publisher',
        'vocalization',
        'raga',
    ];

    protected $fillable = [
        'pad_id',
        'media_type',
        'file_url',
        'youtube_url',
        'file_name',
        'singer',
        'publisher',
        'vocalization',
        'raga',
        'recording_type',
    ];

    public function pad()
    {
        return $this->belongsTo(Pad::class);
    }
}