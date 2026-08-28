<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    // public function handle(Request $request, Closure $next): Response
    // {
    //     return $next($request);
    // }

    public function handle(Request $request, Closure $next)
    {
        // dd(Auth::user()->role_id, Auth::user()->role?->name);
        if (!Auth::check()) {
            return redirect('/login');
        }


        // Check role using relation
        if (Auth::user()->role->name !== 'Admin') {
            abort(403, 'Access Denied');
        }

        return $next($request);
    }
}
