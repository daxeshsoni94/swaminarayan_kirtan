<?php

namespace App\Exceptions;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });

        // Handle 403 Forbidden (permission denied)
        $this->renderable(function (AuthorizationException $e, Request $request) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Forbidden'], 403);
            }

            return Inertia::render('AuthInner/Error/Cover404')
                ->toResponse($request)
                ->setStatusCode(403);
        });

        // Also handle generic 403 HttpException
        $this->renderable(function (HttpException $e, Request $request) {
            if ($e->getStatusCode() === 403) {
                if ($request->expectsJson()) {
                    return response()->json(['message' => 'Forbidden'], 403);
                }

                return Inertia::render('AuthInner/Error/Cover404')
                    ->toResponse($request)
                    ->setStatusCode(403);
            }
        });

        // Handle 404 Not Found
        $this->renderable(function (NotFoundHttpException $e, Request $request) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Not Found'], 404);
            }

            return Inertia::render('AuthInner/Error/Cover404')
                ->toResponse($request)
                ->setStatusCode(404);
        });
    }
}