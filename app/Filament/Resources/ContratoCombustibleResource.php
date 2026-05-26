<?php

// -----------------------------------------------------------------------------
// RECURSO PRINCIPAL PARA CONTRATOS DE COMBUSTIBLE
// -----------------------------------------------------------------------------
// Este recurso administra los contratos de combustible de la institución.
// Cada contrato tiene un número, fechas de inicio y vencimiento, y un monto
// presupuestado. Los usuarios pueden crear, editar y ver contratos, así como
// monitorear el saldo disponible y el porcentaje de presupuesto usado.

namespace App\Filament\Resources;

use App\Filament\Resources\ContratoCombustibleResource\Pages;
use App\Models\ContratoCombustible;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class ContratoCombustibleResource extends Resource
{
    protected static ?string $model = ContratoCombustible::class;

    protected static ?string $navigationGroup = 'Catálogos Globales';

    protected static ?string $navigationLabel = 'Contratos de Combustible';

    protected static ?string $navigationIcon = 'heroicon-o-document-text';

    protected static ?int $navigationSort = 21;

    public static function canViewAny(): bool
    {
        return auth()->user()->hasAnyRole(['superadmin', 'admin', 'ti', 'jefe', 'super_admin']);
    }

    public static function canCreate(): bool
    {
        return auth()->user()->hasAnyRole(['superadmin', 'admin', 'ti', 'jefe', 'super_admin']);
    }

    public static function canEdit($r): bool
    {
        return auth()->user()->hasAnyRole(['superadmin', 'admin', 'ti', 'jefe', 'super_admin']);
    }

    public static function canDelete($r): bool
    {
        return auth()->user()->hasAnyRole(['superadmin', 'admin', 'jefe', 'super_admin']);
    }

    public static function form(Form $form): Form
    {
        return $form->schema([

            Forms\Components\Section::make('Identificación del Contrato')
                ->icon('heroicon-o-document-text')
                ->schema([
                    Forms\Components\TextInput::make('numero_contrato')
                        ->label('Número de Contrato')
                        ->required()
                        ->maxLength(100)
                        ->unique(ignoreRecord: true)
                        ->placeholder('Ej: CONT-2026-001')
    // Reemplaza ->fontFamily('mono') por esto:
                        ->extraInputAttributes(['class' => 'font-mono text-cyan-700 font-bold']),
                    Forms\Components\TextInput::make('nombre')
                        ->label('Nombre / Descripción')
                        ->required()
                        ->maxLength(255)
                        ->placeholder('Ej: Contrato combustible Q1 2026')
                        ->columnSpan(1),

                    Forms\Components\DatePicker::make('fecha_inicio')
                        ->label('Fecha de Inicio')
                        ->native(false)
                        ->displayFormat('d/m/Y'),

                    Forms\Components\DatePicker::make('fecha_fin')
                        ->label('Fecha de Vencimiento')
                        ->native(false)
                        ->displayFormat('d/m/Y')
                        ->after('fecha_inicio'),

                    Forms\Components\Toggle::make('activo')
                        ->label('Activo')
                        ->default(true)
                        ->columnSpan(2),
                ])->columns(2),

            Forms\Components\Section::make('Presupuesto')
                ->icon('heroicon-o-banknotes')
                ->schema([
                    Forms\Components\TextInput::make('monto_inicial')
                        ->label('Monto Inicial ($)')
                        ->numeric()
                        ->required()
                        ->prefix('$')
                        ->minValue(0)
                        ->live(debounce: 500)
                        ->afterStateUpdated(function ($state, $set, $get) {
                            // Al crear, monto_disponible = monto_inicial
                            if (! $get('id')) {
                                $set('monto_disponible', $state);
                            }
                        }),

                    Forms\Components\TextInput::make('monto_disponible')
                        ->label('Monto Disponible ($)')
                        ->numeric()
                        ->required()
                        ->prefix('$')
                        ->minValue(0)
                        ->helperText('Se descuenta automáticamente al asignar cargas.'),

                    Forms\Components\Textarea::make('observaciones')
                        ->label('Observaciones')
                        ->rows(3)
                        ->maxLength(2000)
                        ->columnSpan(2),
                ])->columns(2),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('created_at', 'desc')
            ->columns([
                Tables\Columns\TextColumn::make('numero_contrato')
                    ->label('N° Contrato')
                    ->searchable()->sortable()
                    ->fontFamily('mono')
                    ->weight('bold')
                    ->copyable(),

                Tables\Columns\TextColumn::make('nombre')
                    ->label('Nombre')
                    ->searchable()->sortable()
                    ->description(fn ($record) => $record->observaciones
                        ? \Illuminate\Support\Str::limit($record->observaciones, 60)
                        : null
                    ),

                Tables\Columns\TextColumn::make('monto_inicial')
                    ->label('Monto Inicial')
                    ->money('USD')->sortable(),

                Tables\Columns\TextColumn::make('monto_disponible')
                    ->label('Disponible')
                    ->money('USD')->sortable()
                    ->weight('bold')
                    ->color(fn ($record) => match (true) {
                        $record->monto_disponible <= 0 => 'danger',
                        $record->monto_disponible <= ($record->monto_inicial * 0.20) => 'warning',
                        default => 'success',
                    }),

                Tables\Columns\TextColumn::make('porcentaje_usado')
                    ->label('% Usado')
                    ->getStateUsing(fn ($record) => $record->monto_inicial > 0
                            ? round((1 - $record->monto_disponible / $record->monto_inicial) * 100, 1).'%'
                            : '—'
                    )
                    ->badge()
                    ->color(fn ($record) => match (true) {
                        $record->monto_inicial <= 0 => 'gray',
                        (1 - $record->monto_disponible / $record->monto_inicial) >= 0.80 => 'danger',
                        (1 - $record->monto_disponible / $record->monto_inicial) >= 0.60 => 'warning',
                        default => 'success',
                    }),

                Tables\Columns\TextColumn::make('series_count')
                    ->label('Series')
                    ->counts('series')
                    ->badge()->color('info'),

                Tables\Columns\TextColumn::make('fecha_inicio')
                    ->label('Inicio')->date('d/m/Y')->sortable(),

                Tables\Columns\TextColumn::make('fecha_fin')
                    ->label('Vence')
                    ->date('d/m/Y')->sortable()
                    ->color(fn ($record) => match (true) {
                        ! $record->fecha_fin => 'gray',
                        $record->fecha_fin->isPast() => 'danger',
                        $record->fecha_fin->diffInDays(now()) <= 30 => 'warning',
                        default => 'success',
                    }),

                Tables\Columns\IconColumn::make('activo')
                    ->label('Activo')->boolean()->sortable(),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('activo')->label('Estado'),
                Tables\Filters\Filter::make('vigentes')
                    ->label('Vigentes')
                    ->query(fn ($q) => $q->where('activo', true)
                        ->where(fn ($q) => $q->whereNull('fecha_fin')->orWhere('fecha_fin', '>=', now()))
                    ),
                Tables\Filters\Filter::make('con_saldo')
                    ->label('Con saldo disponible')
                    ->query(fn ($q) => $q->where('monto_disponible', '>', 0)),
            ])
            ->actions([
                Tables\Actions\ViewAction::make()->button()->size('sm'),
                Tables\Actions\EditAction::make()->button()->size('sm')->color('warning'),
                Tables\Actions\DeleteAction::make()->button()->size('sm')
                    ->before(function ($record, $action) {
                        if ($record->solicitudes_count > 0) {
                            $action->cancel();
                            \Filament\Notifications\Notification::make()
                                ->title('No se puede eliminar')
                                ->body('Este contrato tiene solicitudes de combustible asociadas.')
                                ->danger()->send();
                        }
                    }),
            ])
            ->bulkActions([]);
    }

    public static function getEloquentQuery(): \Illuminate\Database\Eloquent\Builder
    {
        return parent::getEloquentQuery()->withCount(['series', 'solicitudes']);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListContratoCombustibles::route('/'),
            'create' => Pages\CreateContratoCombustible::route('/create'),
            'edit' => Pages\EditContratoCombustible::route('/{record}/edit'),
            'view' => Pages\ViewContratoCombustible::route('/{record}'),
        ];
    }
}
