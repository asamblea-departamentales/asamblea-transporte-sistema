<?php
namespace App\Filament\Resources\ContratoMantenimientoResource\Pages;
use App\Filament\Resources\ContratoMantenimientoResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListContratoMantenimientos extends ListRecords
{
    protected static string $resource = ContratoMantenimientoResource::class;
    protected function getHeaderActions(): array
    {
        return [Actions\CreateAction::make()->label('Nuevo Contrato')];
    }
}
