<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */


    public function handle(Request $request, Closure $next): Response
    {
        Log::info('SET LOCALE DEBUG', [
            'session_started' => $request->hasSession(),
            'session_id' => $request->hasSession()
                ? $request->session()->getId()
                : null,
            'session_locale' => $request->hasSession()
                ? $request->session()->get('locale')
                : null,
        ]);

        // $locale = session('locale', 'gu');
        $locale = session('locale', config('app.locale')); // defaults to 'gu'
        app()->setLocale($locale);

        return $next($request);
    }
}
