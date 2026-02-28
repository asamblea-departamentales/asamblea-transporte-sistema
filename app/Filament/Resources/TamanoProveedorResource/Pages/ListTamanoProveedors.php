<?php
namespace App\Filament\Resources\TamanoProveedorResource\Pages;
use App\Filament\Resources\TamanoProveedorResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListTamanoProveedors extends ListRecords
{
    protected static string $resource = TamanoProveedorResource::class;
    protected function getHeaderActions(): array
    {
        return [Actions\CreateAction::make()->label('Nuevo Tamaño')];
    }
}