<?php
namespace App\Filament\Resources\ContratoMantenimientoResource\Pages;
use App\Filament\Resources\ContratoMantenimientoResource;
use Filament\Actions;
use Filament\Infolists;
use Filament\Infolists\Infolist;
use Filament\Resources\Pages\ViewRecord;

class ViewContratoMantenimiento extends ViewRecord
{
    protected static string $resource = ContratoMantenimientoResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\EditAction::make()];
    }

    public function infolist(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            Infolists\Components\Section::make('Contrato')->schema([
                Infolists\Components\TextEntry::make('numero_contrato')
                    ->label('N° Contrato')->fontFamily('mono')->copyable(),
                Infolists\Components\TextEntry::make('nombre')->label('Nombre'),
                Infolists\Components\TextEntry::make('fecha_inicio')->label('Inicio')->date('d/m/Y'),
                Infolists\Components\TextEntry::make('fecha_fin')->label('Vence')->date('d/m/Y'),
                Infolists\Components\IconEntry::make('activo')->label('Activo')->boolean(),
            ])->columns(3),

            Infolists\Components\Section::make('Presupuesto')->schema([
                Infolists\Components\TextEntry::make('monto_inicial')
                    ->label('Monto Inicial')->money('USD'),
                Infolists\Components\TextEntry::make('monto_disponible')
                    ->label('Disponible')->money('USD')
                    ->color(fn ($record) => $record->monto_disponible <= 0 ? 'danger' : 'success'),
                Infolists\Components\TextEntry::make('monto_usado')
                    ->label('Utilizado')
                    ->getStateUsing(fn ($record) => '$' . number_format($record->monto_inicial - $record->monto_disponible, 2))
                    ->color('warning'),
                Infolists\Components\TextEntry::make('observaciones')
                    ->label('Observaciones')->columnSpanFull()->placeholder('—'),
            ])->columns(3),
        ]);
    }
}
