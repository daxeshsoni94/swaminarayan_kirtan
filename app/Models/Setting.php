<?php

namespace App\Models;

use GuzzleHttp\Psr7\Request;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    protected $fillable = [
        'setting_key',
        'setting_value',
        'setting_group',
        'updated_by',
    ];

    protected $casts = [
        'setting_value' => 'array', // auto JSON encode/decode
    ];

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }


    // Get a setting value (supports nested keys with dot notation)
    public static function get(string $key, mixed $default = null): mixed
    {
        $setting = Cache::rememberForever("setting.{$key}", function () use ($key) {
            return static::where('setting_key', $key)->first();
        });

        if (!$setting) {
            return $default;
        }

        return $setting->setting_value ?? $default;
    }


    // Set / update a setting
    public static function set(string $key, mixed $value, string $group = 'general', ?int $userId = null): self
    {
        $setting = static::updateOrCreate(
            ['setting_key' => $key],
            [
                'setting_value' => $value,
                'setting_group' => $group,
                'updated_by'    => $userId ?? auth()->id(),
            ]
        );

        Cache::forget("setting.{$key}");

        return $setting;
    }

    // get all settings of a group as key => value
    public static function getGroup(string $group = 'general'): array
    {
        return static::where('setting_group', $group)
            ->pluck('setting_value', 'setting_key')
            ->toArray();
    }

   
}
