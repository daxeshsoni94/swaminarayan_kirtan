<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

class Pad extends Model
{
    use HasTranslations;
    public $translatable = ['title', 'value'];

    protected $fillable = [
        'created_by',
        'title',
        'value',
        'status',
        'establish_date',
    ];
    protected $casts = [
        'establish_date' => 'date',
    ];
    public function user()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
    // public function categories()
    // {
    //     return $this->belongsToMany(Category::class);
    // }
    // App\Models\Pad.php

    public function categories()
    {
        return $this->belongsToMany(
            Category::class,
            'category_pad',  // same pivot name
            'pad_id',
            'category_id'
        );
    }
    public function recordedVersion()
    {
        return $this->hasOne(Pad_media::class);
    }
    public function recordedVersions()
    {
        return $this->hasMany(\App\Models\Pad_media::class, 'pad_id');
    }

    public function favoritedByUsers()
    {
        return $this->belongsToMany(User::class, 'user_favorite_pads')
            ->withTimestamps();
    }

    // Helper
    public function isFavoritedBy(?User $user): bool
    {
        if (!$user) return false;
        return $this->favoritedByUsers()->where('user_id', $user->id)->exists();
    }
}
