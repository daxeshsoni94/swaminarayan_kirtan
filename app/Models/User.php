<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id',
        'language_id',
        'phone',
        'status',
        'profile',
        'theme_mode',
        'text_size',
        'email_verified_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */

    protected $casts = [
        'name' => 'array',
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function role()
    {
        return $this->belongsTo(Role::class);
    }
    public function language()
    {
        return $this->belongsTo(Language::class);
    }


    public function hasPermission(string $module, string $action): bool
    {
        if ($this->role?->name === 'Admin') {
            return true; // admin bypasses everything
        }

        return $this->role
            ?->permissions()
            ->where('module', $module)
            ->where('action', $action)
            ->exists() ?? false;
    }

    public function permissionList(): array
    {
        if (!$this->role) return [];
        return $this->role->permissions()
            ->get(['module', 'action'])
            ->map(fn($p) => "{$p->module}.{$p->action}")
            ->toArray();
    }

    public function favoritePads()
    {
        return $this->belongsToMany(Pad::class, 'user_favorite_pads')
            ->withTimestamps();
    }
}
