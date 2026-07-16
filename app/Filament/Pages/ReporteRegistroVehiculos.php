<?php

namespace App\Filament\Pages;

use App\Models\Vehiculo;
use Filament\Actions\Action;
use Filament\Forms;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Form;
use Filament\Pages\Page;

class ReporteRegistroVehiculos extends Page
{
    use InteractsWithForms;

    protected static ?string $navigationGroup = 'Reportes';

    protected static ?string $title = 'Reporte de Registro de Vehículos';

    protected static ?string $navigationLabel = 'Registro de Vehículos';

    protected static ?string $navigationIcon = 'heroicon-o-clipboard-document-list';

    protected static ?int $navigationSort = 12;

    protected static string $view = 'filament.pages.reporte-registro-vehiculos';

    public ?int $vehiculo_id = null;

    public ?string $fecha_inicio = null;

    public ?string $fecha_fin = null;

    public function mount(): void
    {
        $this->form->fill();
    }

    public static function canAccess(): bool
    {
        return auth()->user()?->hasAnyRole(['jefe', 'admin', 'ti', 'operativo', 'liquidador', 'super_admin']) ?? false;
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('export_pdf')
                ->label('Exportar PDF')
                ->icon('heroicon-o-printer')
                ->url(fn () => $this->generarUrlPdf())
                ->openUrlInNewTab()
                ->visible(fn () => $this->vehiculo_id && $this->fecha_inicio && $this->fecha_fin),
        ];
    }

    public function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Grid::make(12)->schema([
                Forms\Components\Section::make('Filtros del reporte')
                    ->description('Seleccioná el vehículo y el período a consultar.')
                    ->icon('heroicon-o-funnel')
                    ->collapsible()
                    ->columnSpan(12)
                    ->schema([
                        Forms\Components\Grid::make(12)->schema([
                            Forms\Components\Select::make('vehiculo_id')
                                ->label('Vehículo / Placa')
                                ->options(function () {
                                    return Vehiculo::where('activo', true)
                                        ->orderBy('placa')
                                        ->with('tipo')
                                        ->get()
                                        ->mapWithKeys(function ($v) {
                                            $tipoNombre = $v->tipo?->nombre ?? 'Sin tipo';

                                            return [$v->id => "{$v->placa} — {$tipoNombre}"];
                                        });
                                })
                                ->searchable()
                                ->native(false)
                                ->live()
                                ->columnSpan(['default' => 12, 'md' => 4]),

                            Forms\Components\DatePicker::make('fecha_inicio')
                                ->label('Fecha inicio')
                                ->native(false)
                                ->live()
                                ->columnSpan(['default' => 12, 'md' => 3]),

                            Forms\Components\DatePicker::make('fecha_fin')
                                ->label('Fecha final')
                                ->native(false)
                                ->live()
                                ->afterStateUpdated(function () {
                                    $this->dispatch('$refresh');
                                })
                                ->columnSpan(['default' => 12, 'md' => 3]),

                            Forms\Components\Actions::make([
                                Forms\Components\Actions\Action::make('limpiar')
                                    ->label('Limpiar')
                                    ->color('gray')
                                    ->icon('heroicon-o-x-mark')
                                    ->action(function () {
                                        $this->vehiculo_id = null;
                                        $this->fecha_inicio = null;
                                        $this->fecha_fin = null;
                                        $this->form->fill();
                                    }),
                            ])
                                ->columnSpan(['default' => 12, 'md' => 2])
                                ->alignEnd(),
                        ]),
                    ]),
            ]),
        ])->statePath('');
    }

    private function generarUrlPdf(): string
    {
        return route('reportes.registro-vehiculos.pdf', [
            'vehiculo_id' => $this->vehiculo_id,
            'fecha_inicio' => $this->fecha_inicio,
            'fecha_fin' => $this->fecha_fin,
        ]);
    }
}
