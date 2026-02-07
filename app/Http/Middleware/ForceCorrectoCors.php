<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ForceCorrectCors
{
    public function handle(Request $request, Closure $next)
    {
        $origin = $request->headers->get('Origin');
        
        // Log para debug
        Log::info('CORS Debug', [
            'origin' => $origin,
            'url' => $request->url(),
            'method' => $request->method(),
        ]);
        
        $response = $next($request);
        
        if ($origin === 'https://load-guarantee-ethics-extract.trycloudflare.com') {
            $response->headers->set('Access-Control-Allow-Origin', $origin);
            $response->headers->set('Access-Control-Allow-Credentials', 'true');
            $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization, X-Requested-With, X-XSRF-TOKEN');
        }
        
        // Log de las cabeceras que se están enviando
        Log::info('CORS Response Headers', [
            'Access-Control-Allow-Origin' => $response->headers->get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Credentials' => $response->headers->get('Access-Control-Allow-Credentials'),
        ]);
        
        return $response;
    }
}