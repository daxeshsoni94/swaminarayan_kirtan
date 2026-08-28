<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RolePrefix
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return redirect()->route('login');
        }

        $role = $user->role?->name ?? null;

        if (!$role) {
            abort(403, 'Role not assigned.');
        }

        // Convert role name to URL-friendly value
        $roleSlug = \Illuminate\Support\Str::slug($role);

        // If current URL prefix does not match user's role
        $prefix = $request->route('rolePrefix');

        if ($prefix !== $roleSlug) {
            abort(403);
        }

        return $next($request);
    }
}
