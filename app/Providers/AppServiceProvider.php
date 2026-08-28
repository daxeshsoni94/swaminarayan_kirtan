<?php

namespace App\Providers;

use App\Models\Setting;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // AppServiceProvider or Middleware
        // Inertia::share([
        //     'locale' => fn() => app()->getLocale(),
        // ]);
        $settings = Setting::getGroup('general');

        Config::set('mail.default', $settings['mail_mailer'] ?? env('MAIL_MAILER', 'smtp'));

        Config::set('mail.mailers.smtp.host', $settings['mail_host'] ?? env('MAIL_HOST', 'smtp.gmail.com'));

        Config::set('mail.mailers.smtp.port', $settings['mail_port'] ?? env('MAIL_PORT', 587));

        Config::set('mail.mailers.smtp.username', $settings['mail_username'] ?? env('MAIL_USERNAME'));

        Config::set('mail.mailers.smtp.password', $settings['mail_password'] ?? env('MAIL_PASSWORD'));

        Config::set('mail.mailers.smtp.encryption', $settings['mail_encryption'] ?? env('MAIL_ENCRYPTION', 'tls'));

        Config::set(
            'mail.from.address',
            $settings['mail_from_address'] ?? env('MAIL_FROM_ADDRESS')
        );

        Config::set(
            'mail.from.name',
            $settings['mail_from_name'] ?? env('MAIL_FROM_NAME', env('APP_NAME'))
        );

        Inertia::share([
            'locale' => function () {
                $locale = session('locale', 'gu');

                Log::info('INERTIA SHARED LOCALE', [
                    'locale' => $locale,
                    'session_locale' => session('locale'),
                ]);

                return $locale;
            },

            // Keep your other shared props here
            'auth' => function () {
                return [
                    'user' => Auth::user(),
                ];
            },
        ]);
    }
}
