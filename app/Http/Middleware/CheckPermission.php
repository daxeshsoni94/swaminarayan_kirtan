<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string $module, string $action = 'view'): Response
    {
        if (!$request->user()?->hasPermission($module, $action)) {
            abort(403, 'You do not have permission to access this.');
        }
        return $next($request);
    }
}
