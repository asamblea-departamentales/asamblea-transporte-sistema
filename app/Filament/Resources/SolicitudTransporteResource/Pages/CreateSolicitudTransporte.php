<?php

namespace App\Filament\Resources\SolicitudTransporteResource\Pages;

use App\Filament\Resources\SolicitudTransporteResource;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Database\Eloquent\Model;

class CreateSolicitudTransporte extends CreateRecord
{
    protected static string $resource = SolicitudTransporteResource::class;

    protected function handleRecordCreation(array $data): Model
    {
        // Capturar el usuario y su grupo
        $user = auth()->user();
        $grupo = $user->grupo;

        // Agregar snapshot de prioridad
        $data['prioridad_grupo'] = $grupo?->nivel_prioridad ?? 'baja';
        $data['prioridad_orden'] = $grupo?->orden ?? 999;

        return parent::handleRecordCreation($data);
    }
}
