<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsManager
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // 1 to ID Managera / Portiera
        if (!$user || (int)$user->role_id !== 1) {
            return response()->json(['message' => 'Brak uprawnień do wykonania tej operacji.'], 403);
        }

        return $next($request);
    }
}