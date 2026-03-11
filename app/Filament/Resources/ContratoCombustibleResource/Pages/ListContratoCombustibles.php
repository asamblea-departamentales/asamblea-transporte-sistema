<?php
namespace App\Filament\Resources\ContratoCombustibleResource\Pages;
use App\Filament\Resources\ContratoCombustibleResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListContratoCombustibles extends ListRecords
{
    protected static string $resource = ContratoCombustibleResource::class;
    protected function getHeaderActions(): array
    {
        return [Actions\CreateAction::make()->label('Nuevo Contrato')];
    }
}