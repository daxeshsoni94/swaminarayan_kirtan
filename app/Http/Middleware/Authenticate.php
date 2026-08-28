<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;
use Inertia\Inertia;

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     */
    // protected function redirectTo(Request $request): ?string
    // {
    //     return $request->expectsJson() ? null : route('login');
    // }

    // app/Http/Middleware/Authenticate.php
    protected function unauthenticated($request, array $guards)
    {
        if ($request->expectsJson()) {
            abort(401);
        }

        // Show your Cover404 page
        return Inertia::render('AuthInner/Error/Cover404')   // adjust path to your component
            ->toResponse($request)
            ->setStatusCode(404);
    }
    // C:\Users\ASUS\Downloads\React+Inertia\Saas\resources\js\Pages\AuthInner\Error\Cover404.tsx
}
