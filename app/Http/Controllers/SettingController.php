<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SettingController extends Controller
{
    public function index()
    {
        $settings = Setting::getGroup('general');

        // Normalize bilingual values
        $appName = $settings['app_name'] ?? ['en' => '', 'gu' => ''];
        $address = $settings['address'] ?? ['en' => '', 'gu' => ''];

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
        ]);
    }

    public function update(Request $request)
    {
        // dd([
        //     'name' => $request->file('app_logo')?->getClientOriginalName(),
        //     'mime' => $request->file('app_logo')?->getMimeType(),
        //     'size' => $request->file('app_logo')?->getSize(),
        //     'extension' => $request->file('app_logo')?->getClientOriginalExtension(),
        // ]);
        $validated = $request->validate([
            'app_name.en'       => ['required', 'string', 'max:255'],
            'app_name.gu'       => ['required', 'string', 'max:255'],
            'contact_email'     => ['nullable', 'email', 'max:255'],
            'contact_phone'     => ['nullable', 'string', 'max:20'],
            'address.en'        => ['nullable', 'string', 'max:500'],
            'address.gu'        => ['nullable', 'string', 'max:500'],
            'mail_mailer' => ['required', 'string', 'max:50'],
            'mail_host' => ['required', 'string', 'max:255'],
            'mail_port' => ['required', 'integer'],
            'mail_username' => ['required', 'email'],
            'mail_password' => ['nullable', 'string', 'max:255'],
            'mail_encryption' => ['nullable', 'in:tls,ssl'],
            'mail_from_address' => ['required', 'email'],
            'mail_from_name' => ['required', 'string', 'max:255'],
            'facebook_url'      => ['nullable', 'url', 'max:255'],
            'instagram_url'     => ['nullable', 'url', 'max:255'],
            'youtube_url'       => ['nullable', 'url', 'max:255'],
            'app_logo'          => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        $userId = $request->user()->id;

        // App Name (bilingual)
        Setting::set('app_name', [
            'en' => $validated['app_name']['en'],
            'gu' => $validated['app_name']['gu'],
        ], 'general', $userId);

        // Address (bilingual)
        Setting::set('address', [
            'en' => $validated['address']['en'] ?? '',
            'gu' => $validated['address']['gu'] ?? '',
        ], 'general', $userId);

        // Simple fields
        Setting::set('contact_email', $validated['contact_email'] ?? '', 'general', $userId);
        Setting::set('contact_phone', $validated['contact_phone'] ?? '', 'general', $userId);
        Setting::set('facebook_url', $validated['facebook_url'] ?? '', 'general', $userId);
        Setting::set('instagram_url', $validated['instagram_url'] ?? '', 'general', $userId);
        Setting::set('youtube_url', $validated['youtube_url'] ?? '', 'general', $userId);


        // SMTP Settings
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


        // Only update password if admin entered a new one.

        if (
            !empty($validated['mail_password'])
        ) {
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


        // Logo upload
        if ($request->hasFile('app_logo')) {
            $oldLogo = Setting::get('app_logo');

            if ($oldLogo && Storage::disk('public')->exists($oldLogo)) {
                Storage::disk('public')->delete($oldLogo);
            }

            $path = $request->file('app_logo')->store('settings/logos', 'public');
            Setting::set('app_logo', $path, 'general', $userId);
        }

        return back()->with(
            'success',
            app()->getLocale() === 'gu'
                ? 'સેટિંગ્સ સફળતાપૂર્વક અપડેટ થઈ ગઈ છે.'
                : 'Settings updated successfully.'
        );
    }
}
