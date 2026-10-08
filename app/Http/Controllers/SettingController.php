<?php

namespace App\Http\Controllers;

use App\Models\Language;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SettingController extends Controller
{
    /**
     * Get all available language codes.
     */
    private function supportedLocales(): array
    {
        $codes = Language::query()
            ->pluck('code')
            ->filter()
            ->map(fn($code) => strtolower(trim($code)))
            ->unique()
            ->values()
            ->all();

        return !empty($codes) ? $codes : ['en'];
    }

    /**
     * Return a bilingual/multilingual setting value
     * with every currently available language.
     */
    private function localizedSettingValue(
        mixed $value,
        array $locales
    ): array {
        $result = [];

        $existing = is_array($value) ? $value : [];

        foreach ($locales as $locale) {
            $result[$locale] = $existing[$locale] ?? '';
        }

        return $result;
    }

    public function index()
    {
        $settings = Setting::getGroup('general');

        $locales = $this->supportedLocales();

        $appName = $this->localizedSettingValue(
            $settings['app_name'] ?? [],
            $locales
        );

        $address = $this->localizedSettingValue(
            $settings['address'] ?? [],
            $locales
        );

        return Inertia::render('Admin/Settings/General', [
            'settings' => [
                'app_name' => $appName,

                'app_logo' => $settings['app_logo'] ?? null,

                'contact_email' => $settings['contact_email'] ?? '',
                'contact_phone' => $settings['contact_phone'] ?? '',

                'address' => $address,

                'facebook_url' => $settings['facebook_url'] ?? '',
                'instagram_url' => $settings['instagram_url'] ?? '',
                'youtube_url' => $settings['youtube_url'] ?? '',

                // SMTP settings
                'mail_mailer' => $settings['mail_mailer'] ?? 'smtp',
                'mail_host' => $settings['mail_host'] ?? 'smtp.gmail.com',
                'mail_port' => $settings['mail_port'] ?? '587',
                'mail_username' => $settings['mail_username'] ?? '',
                'mail_password' => $settings['mail_password'] ?? '',
                'mail_encryption' => $settings['mail_encryption'] ?? 'tls',
                'mail_from_address' => $settings['mail_from_address'] ?? '',
                'mail_from_name' => $settings['mail_from_name'] ?? '',
            ],

            'languages' => Language::query()
                ->orderBy('id')
                ->get(['id', 'code', 'name']),
        ]);
    }

    public function update(Request $request)
    {
        $locales = $this->supportedLocales();

        /*
         * Build dynamic validation rules for every language.
         *
         * Example:
         * app_name.en
         * app_name.gu
         * app_name.hi
         * app_name.mr
         */
        $rules = [];

        foreach ($locales as $locale) {
            $rules["app_name.{$locale}"] = [
                'required',
                'string',
                'max:255',
            ];

            $rules["address.{$locale}"] = [
                'nullable',
                'string',
                'max:500',
            ];
        }

        $rules = array_merge($rules, [
            'contact_email' => [
                'nullable',
                'email',
                'max:255',
            ],

            'contact_phone' => [
                'nullable',
                'string',
                'max:20',
            ],

            'mail_mailer' => [
                'required',
                'string',
                'max:50',
            ],

            'mail_host' => [
                'required',
                'string',
                'max:255',
            ],

            'mail_port' => [
                'required',
                'integer',
            ],

            'mail_username' => [
                'required',
                'email',
            ],

            'mail_password' => [
                'nullable',
                'string',
                'max:255',
            ],

            'mail_encryption' => [
                'nullable',
                'in:tls,ssl',
            ],

            'mail_from_address' => [
                'required',
                'email',
            ],

            'mail_from_name' => [
                'required',
                'string',
                'max:255',
            ],

            'facebook_url' => [
                'nullable',
                'url',
                'max:255',
            ],

            'instagram_url' => [
                'nullable',
                'url',
                'max:255',
            ],

            'youtube_url' => [
                'nullable',
                'url',
                'max:255',
            ],

            'app_logo' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],
        ]);

        $validated = $request->validate($rules);

        $userId = $request->user()->id;

        /*
         * App Name
         */
        $appName = [];

        foreach ($locales as $locale) {
            $appName[$locale] =
                $validated['app_name'][$locale] ?? '';
        }

        Setting::set(
            'app_name',
            $appName,
            'general',
            $userId
        );

        /*
         * Address
         */
        $address = [];

        foreach ($locales as $locale) {
            $address[$locale] =
                $validated['address'][$locale] ?? '';
        }

        Setting::set(
            'address',
            $address,
            'general',
            $userId
        );

        /*
         * Simple fields
         */
        Setting::set(
            'contact_email',
            $validated['contact_email'] ?? '',
            'general',
            $userId
        );

        Setting::set(
            'contact_phone',
            $validated['contact_phone'] ?? '',
            'general',
            $userId
        );

        Setting::set(
            'facebook_url',
            $validated['facebook_url'] ?? '',
            'general',
            $userId
        );

        Setting::set(
            'instagram_url',
            $validated['instagram_url'] ?? '',
            'general',
            $userId
        );

        Setting::set(
            'youtube_url',
            $validated['youtube_url'] ?? '',
            'general',
            $userId
        );

        /*
         * SMTP Settings
         */
        Setting::set(
            'mail_mailer',
            $validated['mail_mailer'],
            'general',
            $userId
        );

        Setting::set(
            'mail_host',
            $validated['mail_host'],
            'general',
            $userId
        );

        Setting::set(
            'mail_port',
            $validated['mail_port'],
            'general',
            $userId
        );

        Setting::set(
            'mail_username',
            $validated['mail_username'],
            'general',
            $userId
        );

        /*
         * Only update password if a new password was entered.
         */
        if (!empty($validated['mail_password'])) {
            Setting::set(
                'mail_password',
                $validated['mail_password'],
                'general',
                $userId
            );
        }

        Setting::set(
            'mail_encryption',
            $validated['mail_encryption'] ?? '',
            'general',
            $userId
        );

        Setting::set(
            'mail_from_address',
            $validated['mail_from_address'],
            'general',
            $userId
        );

        Setting::set(
            'mail_from_name',
            $validated['mail_from_name'],
            'general',
            $userId
        );

        /*
         * Logo upload
         */
        if ($request->hasFile('app_logo')) {
            $oldLogo = Setting::get('app_logo');

            if (
                $oldLogo &&
                Storage::disk('public')->exists($oldLogo)
            ) {
                Storage::disk('public')->delete($oldLogo);
            }

            $path = $request
                ->file('app_logo')
                ->store('settings/logos', 'public');

            Setting::set(
                'app_logo',
                $path,
                'general',
                $userId
            );
        }

        /*
         * Global localized toast.
         *
         * Layout.tsx will translate this key using the
         * currently selected application language.
         */
        return back()->with(
            'success',
            'settings_updated_successfully'
        );
    }


    /**
     * Return current layout settings (used by frontend + shared via Inertia)
     */
    public function getLayoutSettings()
    {

        return response()->json([
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
        ]);
    }

    /**
     * Save layout settings (Admin only)
     * Values are language-neutral codes → no localization needed
     */
    public function updateLayout(Request $request)
    {

        $validated = $request->validate([
            'layoutType' => 'required|string',
            'layoutModeType' => 'required|string',
            'layoutWidthType' => 'nullable|string',          // ← removed the strict in:fluid,boxed
            'layoutPositionType' => 'nullable|string',
            'topbarThemeType' => 'required|string',
            'leftsidbarSizeType' => 'nullable|string',
            'leftSidebarViewType' => 'nullable|string',
            'leftSidebarType' => 'nullable|string',
            'leftSidebarImageType' => 'nullable|string',
            'sidebarVisibilitytype' => 'nullable|string',
            'preloader' => 'required|string',
            'custom_sidebar_image_file' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:5120',
        ]);
        // dd($validated);

        $userId = $request->user()->id;

        Setting::set('layout_type', $validated['layoutType'], 'layout', $userId);
        Setting::set('layout_mode', $validated['layoutModeType'], 'layout', $userId);
        Setting::set('layout_width', $validated['layoutWidthType'] ?? 'fluid', 'layout', $userId);
        Setting::set('layout_position', $validated['layoutPositionType'] ?? 'fixed', 'layout', $userId);
        Setting::set('topbar_theme', $validated['topbarThemeType'], 'layout', $userId);
        Setting::set('sidebar_size', $validated['leftsidbarSizeType'] ?? 'lg', 'layout', $userId);
        Setting::set('sidebar_view', $validated['leftSidebarViewType'] ?? 'default', 'layout', $userId);
        Setting::set('sidebar_color', $validated['leftSidebarType'] ?? 'dark', 'layout', $userId);
        Setting::set('sidebar_image', $validated['leftSidebarImageType'] ?? 'none', 'layout', $userId);
        Setting::set('sidebar_visibility', $validated['sidebarVisibilitytype'] ?? 'show', 'layout', $userId);
        Setting::set('preloader', $validated['preloader'], 'layout', $userId);

        if ($request->hasFile('custom_sidebar_image_file')) {
            $path = $request->file('custom_sidebar_image_file')->store('sidebar', 'public');
            Setting::set('custom_sidebar_image_path', '/storage/' . $path, 'layout', $userId);
        }

        // Translation key – works for any language automatically
        return back()->with('success', 'layout_updated_successfully');
    }



    // public function updateLayout(Request $request)
    // {

    //     // 1. First see what is actually arriving
    //     \Log::info('Layout update raw data', $request->all());

    //     try {
    //         $validated = $request->validate([
    //             'layoutType' => 'required|string|in:vertical,horizontal,twocolumn,semibox',
    //             'layoutModeType' => 'required|string|in:light,dark',
    //             'layoutWidthType' => 'nullable|string',
    //             'layoutPositionType' => 'nullable|string|in:fixed,scrollable',
    //             'topbarThemeType' => 'required|string|in:light,dark',
    //             'leftsidbarSizeType' => 'nullable|string',
    //             'leftSidebarViewType' => 'nullable|string|in:default,detached',
    //             'leftSidebarType' => 'nullable|string',
    //             'leftSidebarImageType' => 'nullable|string',
    //             'sidebarVisibilitytype' => 'nullable|string|in:show,hidden',
    //             'preloader' => 'required|string|in:enable,disable',
    //         ]);
    //     } catch (\Illuminate\Validation\ValidationException $e) {
    //         // This will show you exactly which field failed
    //         dd([
    //             'errors' => $e->errors(),
    //             'received' => $request->all(),
    //         ]);
    //     }

    //     dd('Validation passed!', $validated);   // temporary

    //     $userId = $request->user()->id;

    //     Setting::set('layout_type', $validated['layoutType'], 'layout', $userId);
    //     Setting::set('layout_mode', $validated['layoutModeType'], 'layout', $userId);
    //     Setting::set('layout_width', $validated['layoutWidthType'] ?? 'fluid', 'layout', $userId);
    //     Setting::set('layout_position', $validated['layoutPositionType'] ?? 'fixed', 'layout', $userId);
    //     Setting::set('topbar_theme', $validated['topbarThemeType'], 'layout', $userId);
    //     Setting::set('sidebar_size', $validated['leftsidbarSizeType'] ?? 'lg', 'layout', $userId);
    //     Setting::set('sidebar_view', $validated['leftSidebarViewType'] ?? 'default', 'layout', $userId);
    //     Setting::set('sidebar_color', $validated['leftSidebarType'] ?? 'dark', 'layout', $userId);
    //     Setting::set('sidebar_image', $validated['leftSidebarImageType'] ?? 'none', 'layout', $userId);
    //     Setting::set('sidebar_visibility', $validated['sidebarVisibilitytype'] ?? 'show', 'layout', $userId);
    //     Setting::set('preloader', $validated['preloader'], 'layout', $userId);

    //     // Translation key – works for any language automatically
    //     return back()->with('success', 'layout_updated_successfully');
    // }
}
