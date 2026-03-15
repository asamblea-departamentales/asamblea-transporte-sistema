<?php

namespace App\Filament\Resources\PlanificacionFlotaResource\Pages;

use App\Filament\Resources\PlanificacionFlotaResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditPlanificacionFlota extends EditRecord
{
    protected static string $resource = PlanificacionFlotaResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
