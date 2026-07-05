<?php

namespace App\Filament\Resources\SolicitudTransporteResource\Pages;

// Este archivo define la página de visualización detallada de una solicitud de transporte dentro del panel de administración construido con Filament. Permite a los usuarios autorizados ver los detalles completos de la solicitud, agregar observaciones, pre-aprobar, aprobar/programar y asignar transporte, todo desde una interfaz intuitiva. Además, incluye lógica para resolver la disponibilidad de motoristas según el vehículo seleccionado y muestra esta información de manera clara en la interfaz.

use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Filament\Resources\SolicitudTransporteResource;
use App\Models\Motorista;
use App\Models\MotoristaEstado;
use App\Models\SolicitudTransporte;
use Filament\Actions;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ViewRecord;

class ViewSolicitudTransporte extends ViewRecord
{
    protected static string $resource = SolicitudTransporteResource::class;

    private function resolverMotorista(int $vehiculoId): array
    {
        $vehiculo = \App\Models\Vehiculo::with('asignacionVigenteMotorista.motorista')->find($vehiculoId);
        $motoristaTitular = $vehiculo?->asignacionVigenteMotorista?->motorista;

        if ($motoristaTitular) {
            $ultimoEstado = MotoristaEstado::where('motorista_id', $motoristaTitular->id)
                ->orderByDesc('fecha_inicio')
                ->orderByDesc('id')
                ->first();

            $titularDisponible = ! ($ultimoEstado && ! filter_var($ultimoEstado->activo, FILTER_VALIDATE_BOOLEAN));

            if ($titularDisponible) {
                return [
                    'id' => $motoristaTitular->id,
                    'label' => "{$motoristaTitular->nombre} — DUI: {$motoristaTitular->dui}",
                    'disponible' => true,
                    'sugerido' => false,
                ];
            }

            $motivoBloqueo = $ultimoEstado?->motivo ?? 'No disponible';
        }

        $motoristasInactivos = MotoristaEstado::orderByDesc('fecha_inicio')
            ->orderByDesc('id')
            ->get()
            ->unique('motorista_id')
            ->filter(fn ($st) => ! filter_var($st->activo, FILTER_VALIDATE_BOOLEAN))
            ->pluck('motorista_id')
            ->toArray();

        $sugerido = Motorista::where('activo', true)
            ->whereNotIn('id', $motoristasInactivos)
            ->when($motoristaTitular, fn ($q) => $q->where('id', '!=', $motoristaTitular->id))
            ->orderBy('nombre')
            ->first();

        if ($motoristaTitular && $sugerido) {
            return [
                'id' => $sugerido->id,
                'label' => "⚠️ {$motoristaTitular->nombre} no disponible ({$motivoBloqueo}). 💡 Sugerido: {$sugerido->nombre} — DUI: {$sugerido->dui}",
                'disponible' => false,
                'sugerido' => true,
            ];
        }

        if ($motoristaTitular && ! $sugerido) {
            return [
                'id' => null,
                'label' => "no_disponible_sin_sustituto|{$motoristaTitular->nombre} no disponible ({$motivoBloqueo}) y no hay sustitutos.",
                'disponible' => false,
                'sugerido' => false,
            ];
        }

        return [
            'id' => null,
            'label' => 'sin_motorista',
            'disponible' => false,
            'sugerido' => false,
        ];
    }

    private function validarMotoristaDisponible(?int $motoristaId): void
    {
        if (! $motoristaId) {
            return;
        }

        $ultimoEstado = MotoristaEstado::where('motorista_id', $motoristaId)
            ->orderByDesc('fecha_inicio')
            ->orderByDesc('id')
            ->first();

        if ($ultimoEstado && ! filter_var($ultimoEstado->activo, FILTER_VALIDATE_BOOLEAN)) {
            Notification::make()
                ->title('Acción Bloqueada')
                ->body('El motorista seleccionado está marcado como NO DISPONIBLE. Seleccioná otro.')
                ->danger()
                ->send();

            \Filament\Support\Exceptions\Halt::throw();
        }
    }

    private function htmlMotorista(?string $label): \Illuminate\Support\HtmlString
    {
        if (! $label) {
            return new \Illuminate\Support\HtmlString("
                <div style='background:#f9fafb;border:1.5px dashed #e5e7eb;border-radius:12px;padding:14px 18px;color:#9ca3af;font-size:13px;'>
                    👤 Selecciona un vehículo para ver el motorista
                </div>
            ");
        }

        if ($label === 'sin_motorista') {
            return new \Illuminate\Support\HtmlString("
                <div style='background:#fef2f2;border:1.5px solid #fca5a5;border-radius:12px;padding:14px 18px;color:#dc2626;font-size:13px;font-weight:600;'>
                    ⚠️ Este vehículo no tiene motorista asignado
                </div>
            ");
        }

        if (str_starts_with($label, 'no_disponible_sin_sustituto|')) {
            $msg = str_replace('no_disponible_sin_sustituto|', '', $label);

            return new \Illuminate\Support\HtmlString("
                <div style='background:#fef2f2;border:1.5px solid #fca5a5;border-radius:12px;padding:14px 18px;color:#dc2626;font-size:13px;font-weight:600;'>
                    ❌ {$msg}
                </div>
            ");
        }

        if (str_contains($label, '⚠️') || str_contains($label, '💡')) {
            return new \Illuminate\Support\HtmlString("
                <div style='background:#fffbeb;border:1.5px solid #fcd34d;border-radius:12px;padding:14px 18px;color:#92400e;font-size:13px;font-weight:600;'>
                    {$label}
                </div>
            ");
        }

        return new \Illuminate\Support\HtmlString("
            <div style='background:#f0fdf4;border:1.5px solid #86efac;border-radius:12px;padding:14px 18px;color:#166534;font-size:13px;font-weight:600;'>
                ✅ {$label}
            </div>
        ");
    }

    protected function getHeaderActions(): array
    {
        return [

            // ── MISIÓN OFICIAL ────────────────────────────────────────────
            Actions\Action::make('mision_oficial')
                ->button()
                ->size('lg')
                ->label('Generar Misión Oficial')
                ->color('gray')
                ->icon('heroicon-o-document-text')
                ->url(fn (SolicitudTransporte $record) => route('reportes.mision-oficial.pdf', ['solicitud' => $record]))
                ->openUrlInNewTab()
                ->visible(fn (SolicitudTransporte $record) => auth()->check() &&
                    auth()->user()->hasAnyRole(['jefe', 'admin', 'ti', 'super_admin', 'operativo']) &&
                    $record->vehiculo_id !== null &&
                    $record->motorista_id !== null &&
                    in_array($record->estado, [
                        EstadoSolicitudEnum::APROBADA,
                        EstadoSolicitudEnum::PROGRAMADA,
                        EstadoSolicitudEnum::ASIGNADA,
                        EstadoSolicitudEnum::COMPLETADA,
                    ])
                ),

            // ── DOCUMENTO OFICIAL ─────────────────────────────────────────
            Actions\Action::make('documento_oficial')
                ->button()
                ->size('lg')
                ->label('Documento Oficial')
                ->color('success')
                ->icon('heroicon-o-printer')
                ->url(fn (SolicitudTransporte $record) => route(
                    'reportes.solicitud-autorizacion.pdf',
                    ['solicitud' => $record->id]
                ))
                ->openUrlInNewTab(),
        ];
    }

    protected function canCreate(): bool
    {
        return false;
    }
}
