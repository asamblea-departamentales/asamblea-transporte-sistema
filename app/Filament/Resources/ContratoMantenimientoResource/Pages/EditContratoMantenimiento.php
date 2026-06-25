<?php
namespace App\Filament\Resources\ContratoMantenimientoResource\Pages;
use App\Filament\Resources\ContratoMantenimientoResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditContratoMantenimiento extends EditRecord
{
    protected static string $resource = ContratoMantenimientoResource::class;
    protected function getHeaderActions(): array { return [Actions\DeleteAction::make()]; }
    protected function getRedirectUrl(): string { return $this->getResource()::getUrl('index'); }
}
