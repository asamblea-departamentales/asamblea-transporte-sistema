<?php

namespace App\Http\Controllers\Api;

use App\Domain\Solicitudes\Services\Dashboard\DashboardService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(
        protected DashboardService $dashboardService,
    ) {}

    public function summary(Request $request)
    {
        return response()->json($this->dashboardService->summary($request));
    }

    public function recientes(Request $request)
    {
        return response()->json($this->dashboardService->recientes($request));
    }

    public function historialJefatura(Request $request)
    {
        return response()->json($this->dashboardService->historialJefatura($request));
    }
}
