<?php
namespace App\Filament\Resources\ContratoCombustibleResource\Pages;
use App\Filament\Resources\ContratoCombustibleResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditContratoCombustible extends EditRecord
{
    protected static string $resource = ContratoCombustibleResource::class;
    protected function getHeaderActions(): array { return [Actions\DeleteAction::make()]; }
    protected function getRedirectUrl(): string { return $this->getResource()::getUrl('index'); }
}