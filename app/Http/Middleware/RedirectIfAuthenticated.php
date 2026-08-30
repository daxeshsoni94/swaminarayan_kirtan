<?php

namespace App\Http\Middleware;

use App\Providers\RouteServiceProvider;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Str;

class RedirectIfAuthenticated
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$guards): Response
    {
        $guards = empty($guards) ? [null] : $guards;

        foreach ($guards as $guard) {
            if (Auth::guard($guard)->check()) {
                // return redirect(RouteServiceProvider::HOME);
                $user = Auth::guard($guard)->user();
                $role = $user->role?->name;    // Get user's role
                if (!$role) {
                    abort(403, 'Role not assigned.');
                }
                $rolePrefix = Str::slug($role);


                // Redirect according to role
                return redirect()->route('role.pads.list', ['rolePrefix' => $rolePrefix,]);
            }
        }

        return $next($request);
    }
}
