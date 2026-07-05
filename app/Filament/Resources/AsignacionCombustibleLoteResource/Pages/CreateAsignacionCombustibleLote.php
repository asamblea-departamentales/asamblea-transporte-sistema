<?php

namespace App\Filament\Resources\AsignacionCombustibleLoteResource\Pages;

use App\Domain\Solicitudes\Services\Lotes\LoteCombustibleService;
use App\Filament\Resources\AsignacionCombustibleLoteResource;
use Filament\Resources\Pages\CreateRecord;
use Override;

class CreateAsignacionCombustibleLote extends CreateRecord
{
    protected static string $resource = AsignacionCombustibleLoteResource::class;

    #[Override]
    protected function handleRecordCreation(array $data): \Illuminate\Database\Eloquent\Model
    {
        return app(LoteCombustibleService::class)->crearLote($data, auth()->id());
    }
}
