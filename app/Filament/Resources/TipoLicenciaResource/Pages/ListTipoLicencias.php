<?php

namespace App\Filament\Resources\TipoLicenciaResource\Pages;

use App\Filament\Resources\TipoLicenciaResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListTipoLicencias extends ListRecords
{
    protected static string $resource = TipoLicenciaResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make()->label('Nuevo Tipo de Licencia'),
        ];
    }
}
