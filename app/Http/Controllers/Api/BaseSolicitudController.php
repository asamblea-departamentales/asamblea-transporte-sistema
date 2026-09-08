<?php

namespace App\Http\Controllers\Api;

use App\Domain\Solicitudes\Contracts\Workflowable;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

abstract class BaseSolicitudController extends Controller
{
    protected function authorizeOwner(Workflowable $solicitud): void
    {
        if ($solicitud->getSolicitanteId() !== Auth::id()) {
            abort(Response::HTTP_FORBIDDEN, 'No tienes permiso para realizar esta acción.');
        }
    }

    protected function authorizeJefe(): void
    {
        if (! Auth::user()->hasAnyRole(['jefe', 'admin', 'ti', 'super_admin'])) {
            abort(Response::HTTP_FORBIDDEN, 'Acción permitida únicamente para personal con rol de jefatura.');
        }
    }

    protected function authorizeOperativo(): void
    {
        if (! Auth::user()->hasAnyRole(['operativo', 'admin', 'ti', 'super_admin'])) {
            abort(Response::HTTP_FORBIDDEN, 'Acción permitida únicamente para personal operativo.');
        }
    }

    protected function authorizeView(Workflowable $solicitud): void
    {
        $user = Auth::user();

        if ($user->hasAnyRole(['jefe', 'admin', 'ti', 'super_admin'])) {
            return;
        }

        if ($solicitud->getSolicitanteId() !== $user->id) {
            abort(Response::HTTP_FORBIDDEN, 'No tienes permiso para ver esta solicitud.');
        }
    }

    protected function authorizeDocumento(Workflowable $solicitud, array $estadosPermitidos): void
    {
        $estado = $solicitud->getEstado()?->value;

        if (! in_array($estado, $estadosPermitidos, true)) {
            abort(Response::HTTP_UNPROCESSABLE_ENTITY, 'La solicitud no está en un estado que permita descargar el documento.');
        }
    }
}
