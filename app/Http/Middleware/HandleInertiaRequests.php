<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tightenco\Ziggy\Ziggy;

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
    public function version(Request $request): string|null
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */



    // public function share(Request $request): array
    // {
    //     return array_merge(parent::share($request), [
    //         'auth' => [
    //             'user' => $request->user(),
    //             'role' => $request->user()?->role?->name,
    //             'permissions' => $request->user()?->permissionList() ?? [],
    //         ],
    //         // 'locale' => app()->getLocale(),
    //         'locale' => session('locale', 'gu'),
    //     ]);
    // }


    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user(),
                'role' => $request->user()?->role?->name,
                'permissions' => $request->user()?->permissionList() ?? [],
            ],

            'locale' => session('locale', 'gu'),

            // Global application settings
            'settings' => [
                'app_name' => Setting::get('app_name', [
                    'en' => '',
                    'gu' => '',
                ]),

                'app_logo' => Setting::get('app_logo'),

                'contact_email' => Setting::get('contact_email', ''),
                'contact_phone' => Setting::get('contact_phone', ''),

                'address' => Setting::get('address', [
                    'en' => '',
                    'gu' => '',
                ]),

                'facebook_url' => Setting::get('facebook_url', ''),
                'instagram_url' => Setting::get('instagram_url', ''),
                'youtube_url' => Setting::get('youtube_url', ''),
            ],

            'menuPages' => \App\Models\Page::where('status', 'published')
                ->orderBy('page_group')
                ->orderBy('title')
                ->get(['id', 'title', 'slug', 'page_group']),


            'flash' => [
                'success' => fn() => $request->session()->get('success'),
                'error' => fn() => $request->session()->get('error'),
            ],
            'rolePrefix' => $request->user()?->role?->name === 'Admin'
                ? 'admin'
                : 'user',
        ]);
    }
}
