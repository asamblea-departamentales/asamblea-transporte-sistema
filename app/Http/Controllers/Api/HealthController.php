<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class HealthController extends Controller
{
    public function __invoke(): JsonResponse
    {
        try {
            $database = DB::connection()->getPdo() !== null;
        } catch (\Throwable) {
            $database = false;
        }

        return response()->json([
            'status' => $database ? 'ok' : 'error',
            'database' => $database,
            'timestamp' => now()->toIso8601String(),
        ]);
    }
}
