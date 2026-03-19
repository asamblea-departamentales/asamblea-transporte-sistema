<?php

namespace App\Filament\Pages;

use Filament\Pages\Page;
use App\Domain\Solicitudes\Services\Liquidaciones\LiquidacionUnifiedService;

class PanelLiquidaciones extends Page
{
    protected static ?string $navigationGroup = 'Liquidación';
    protected static ?string $navigationLabel = 'Panel de Liquidación';
    protected static ?string $navigationIcon = 'heroicon-o-check-badge';

    protected static string $view = 'filament.pages.panel-liquidaciones';

    public $data = [];

    public function mount()
    {
        $this->data = app(LiquidacionUnifiedService::class)->getAll();
    }

    public static function canAccess(): bool
    {
        return auth()->user()?->hasAnyRole(['liquidador', 'jefe', 'operativo']);
    }
}