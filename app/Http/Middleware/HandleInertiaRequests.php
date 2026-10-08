<?php

namespace App\Http\Middleware;

use App\Models\Language;
use App\Models\Page;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [

            /*
            |--------------------------------------------------------------------------
            | Authentication
            |--------------------------------------------------------------------------
            */
            'auth' => [
                'user' => $request->user(),
                'role' => $request->user()?->role?->name,
                'permissions' => $request->user()?->permissionList() ?? [],
            ],

            /*
            |--------------------------------------------------------------------------
            | Current Locale
            |--------------------------------------------------------------------------
            |
            | Example:
            | session('locale') = "gu"
            | session('locale') = "en"
            | session('locale') = "hi"
            |
            */
            'locale' => session('locale', 'gu'),

            /*
            |--------------------------------------------------------------------------
            | Available Languages
            |--------------------------------------------------------------------------
            |
            | Languages come dynamically from the database.
            |
            */
            'availableLanguages' => Language::orderBy('id')
                ->get([
                    'id',
                    'code',
                    'name',
                ]),

            /*
            |--------------------------------------------------------------------------
            | Global Application Settings
            |--------------------------------------------------------------------------
            */
            'settings' => [
                'app_name' => Setting::get('app_name', []),
                'app_logo' => Setting::get('app_logo'),
                'contact_email' => Setting::get('contact_email', ''),
                'contact_phone' => Setting::get('contact_phone', ''),
                'address' => Setting::get('address', []),
                'facebook_url' => Setting::get('facebook_url', ''),
                'instagram_url' => Setting::get('instagram_url', ''),
                'youtube_url' => Setting::get('youtube_url', ''),
            ],

            /*
            |--------------------------------------------------------------------------
            | Dynamic Published Pages
            |--------------------------------------------------------------------------
            */
            'menuPages' => Page::where('status', 'published')
                ->orderBy('page_group')
                ->orderBy('title')
                ->get([
                    'id',
                    'title',
                    'slug',
                    'page_group',
                ]),

            /*
            |--------------------------------------------------------------------------
            | Flash Messages
            |--------------------------------------------------------------------------
            |
            | Controllers should continue sending translation keys:
            |
            | ->with('success', 'pad_created_success')
            |
            | React can resolve the key through the existing `tr()` function
            | because messages.json is merged into translations below.
            |
            */
            'flash' => [
                'success' => fn() => $request
                    ->session()
                    ->get('success'),

                'error' => fn() => $request
                    ->session()
                    ->get('error'),

                'warning' => fn() => $request
                    ->session()
                    ->get('warning'),
            ],

            /*
            |--------------------------------------------------------------------------
            | Translations
            |--------------------------------------------------------------------------
            |
            | IMPORTANT:
            |
            | This keeps the SAME prop name:
            |
            |     translations
            |
            | Therefore existing React components do NOT need to change.
            |
            | Laravel loads:
            |
            | lang/en/en.json
            | lang/en/messages.json
            |
            | OR:
            |
            | lang/gu/gu.json
            | lang/gu/messages.json
            |
            | and combines them into one object.
            |
            */
            'translations' => function () {

                /*
                |--------------------------------------------------------------------------
                | Get current locale
                |--------------------------------------------------------------------------
                */
                $locale = session(
                    'locale',
                    app()->getLocale()
                );

                $translations = [];

                /*
                |--------------------------------------------------------------------------
                | UI Translations
                |--------------------------------------------------------------------------
                |
                | Example:
                |
                | lang/en/en.json
                | lang/gu/gu.json
                |
                */
                $translationPath = lang_path(
                    "{$locale}/{$locale}.json"
                );

                if (file_exists($translationPath)) {
                    $translations = json_decode(
                        file_get_contents($translationPath),
                        true
                    ) ?? [];
                }

                /*
                |--------------------------------------------------------------------------
                | Message Translations
                |--------------------------------------------------------------------------
                |
                | Example:
                |
                | lang/en/messages.json
                | lang/gu/messages.json
                |
                | These are merged into the SAME translations object.
                |
                */
                $messagesPath = lang_path(
                    "{$locale}/messages.json"
                );

                if (file_exists($messagesPath)) {
                    $messages = json_decode(
                        file_get_contents($messagesPath),
                        true
                    ) ?? [];

                    $translations = array_merge(
                        $translations,
                        $messages
                    );
                }

                /*
                |--------------------------------------------------------------------------
                | Return combined translations
                |--------------------------------------------------------------------------
                */
                return $translations;
            },

            /*
            |--------------------------------------------------------------------------
            | Permission Translations
            |--------------------------------------------------------------------------
            |
            | Example:
            |
            | lang/en/permissions.php
            | lang/gu/permissions.php
            |
            */
            'permissionTranslations' => function () {

                $locale = session(
                    'locale',
                    app()->getLocale()
                );

                $permissionPath = lang_path(
                    "{$locale}/permissions.json"
                );

                if (file_exists($permissionPath)) {
                    return json_decode(
                        file_get_contents($permissionPath),
                        true
                    ) ?? [];
                }

                return [];
            },

            /*
            |--------------------------------------------------------------------------
            | Dynamic Role Prefix
            |--------------------------------------------------------------------------
            |
            | Admin       -> admin
            | Sub Admin   -> sub-admin
            | User        -> user
            | Vendor      -> vendor
            |
            */
            'rolePrefix' => $request->user()?->role?->name
                ? str($request->user()->role->name)
                    ->lower()
                    ->replace(' ', '-')
                    ->toString()
                : 'admin',

            // 'categoryTypes' => collect(config('category_types'))
            //     ->map(fn($cfg, $key) => [
            //         'id' => $key,
            //         'translation_key' => $cfg['translation_key'],
            //         'icon' => $cfg['icon'] ?? 'bx bx-category',
            //         'is_custom' => $cfg['is_custom'] ?? false,
            //     ])
            //     ->values()
            //     ->all(),


            'categoryTypes' => function () {
                $locale = session('locale', app()->getLocale());

                // Fixed types from config
                $configured = collect(config('category_types', []))
                    ->map(function ($cfg, $key) {
                    return [
                        'id' => $key,
                        'translation_key' => $cfg['translation_key'] ?? $key,
                        'label' => null,
                        'english_label' => \Illuminate\Support\Facades\Lang::get('messages.' . ($cfg['translation_key'] ?? $key), [], 'en'),
                        'icon' => $cfg['icon'] ?? 'bx bx-category',
                        'is_custom' => (bool) ($cfg['is_custom'] ?? false),
                        'is_dynamic' => false,
                        'custom_type' => null,
                        'search_terms' => $cfg['search_terms'] ?? '',
                    ];
                })
                    ->values();

                // Dynamic types from custom categories in DB
                $dynamic = \App\Models\Category::query()
                    ->where('is_custom', true)
                    ->get(['id', 'type'])
                    ->map(function ($cat) use ($locale) {
                    $label = $cat->getTranslation('type', $locale, false);

                    if (!is_string($label) || trim($label) === '') {
                        $label = $cat->getTranslation('type', 'en', false);
                    }

                    if (!is_string($label) || trim($label) === '') {
                        $all = $cat->getTranslations('type') ?? [];
                        $label = collect($all)->first(
                            fn($v) => is_string($v) && trim($v) !== ''
                        );
                    }

                    $label = is_string($label) ? trim($label) : null;
                    if (!$label) {
                        return null;
                    }

                    $enLabel = $cat->getTranslation('type', 'en', false);

                    return [
                        'id' => 'custom_' . \Illuminate\Support\Str::slug($label),
                        'translation_key' => $label,
                        'label' => $label, // show this text in navbar
                        'english_label' => is_string($enLabel) ? trim($enLabel) : $label,
                        'icon' => 'bx bx-category',
                        'is_custom' => true,
                        'is_dynamic' => true,
                        'custom_type' => $label, // used for filtering
                    ];
                })
                    ->filter()
                    ->unique(fn($row) => mb_strtolower($row['custom_type']))
                    ->values();

                // Keep fixed types + generic "custom" + dynamic types
                return $configured
                    ->concat($dynamic)
                    ->values()
                    ->all();
            },


            /*
|--------------------------------------------------------------------------
| Global Layout Settings (controlled by Admin only)
|--------------------------------------------------------------------------
| These values are language-neutral codes.
| All users receive the same layout the Admin last saved.
*/
            'layoutSettings' => [
                'layoutType' => Setting::get('layout_type', 'vertical'),
                'layoutModeType' => Setting::get('layout_mode', 'light'),
                'layoutWidthType' => Setting::get('layout_width', 'fluid'),
                'layoutPositionType' => Setting::get('layout_position', 'fixed'),
                'topbarThemeType' => Setting::get('topbar_theme', 'light'),
                'leftsidbarSizeType' => Setting::get('sidebar_size', 'lg'),
                'leftSidebarViewType' => Setting::get('sidebar_view', 'default'),
                'leftSidebarType' => Setting::get('sidebar_color', 'dark'),
                'leftSidebarImageType' => Setting::get('sidebar_image', 'none'),
                'sidebarVisibilitytype' => Setting::get('sidebar_visibility', 'show'),
                'preloader' => Setting::get('preloader', 'disable'),
                'sidebarCustomImage' => Setting::get('custom_sidebar_image_path', ''),
            ],
        ]);
    }
}
