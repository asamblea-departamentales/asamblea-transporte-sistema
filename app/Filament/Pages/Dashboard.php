<?php

namespace App\Filament\Pages;

use Filament\Pages\Dashboard as BaseDashboard;

class Dashboard extends BaseDashboard
{
    protected static ?string $title = 'Panel de Control';
    protected static ?string $navigationLabel = 'Panel de Control';
    protected static ?string $navigationIcon = 'heroicon-o-home';

    /**
     * Se cambia a 'public' y se agrega el tipo de retorno compatible
     */
    public function getColumns(): int | string | array
    {
        return 3;
    }
}