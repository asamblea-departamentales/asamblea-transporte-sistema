<?php

// -----------------------------------------------------------------------------
// RECURSO PRINCIPAL PARA BITÁCORA DE EVENTOS
// -----------------------------------------------------------------------------
// Este recurso muestra el registro de auditoría del sistema (bitácora).
// Aquí se lista cada operación importante que los usuarios realizan, como
// crear, aprobar o rechazar solicitudes. Solo los jefes y administradores
// pueden ver esta información. No se pueden crear ni editar registros aquí.

namespace App\Filament\Resources;

use App\Filament\Resources\BitacoraEventoResource\Pages;
use App\Filament\Resources\BitacoraEventoResource\RelationManagers;
use App\Models\BitacoraEvento;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class BitacoraEventoResource extends Resource
{
    protected static ?string $model = BitacoraEvento::class;

    protected static ?string $navigationGroup = 'Auditoría';
    
    protected static ?string $navigationLabel = 'Bitácora de Eventos';
    protected static ?string $navigationIcon = 'heroicon-o-clipboard-document-list';

    protected static ?int $navigationSort = 3;

    //Restricciones de acceso a la Bitácora de Eventos
    public static function canViewAny(): bool
    {
        return auth()->user()->hasAnyRole(['jefe', 'admin', 'super_admin', 'super-admin', 'superadmin']);
    }
    //restricción para crear nuevos registros en la bitácora
    public static function canCreate(): bool
    {
        return false;
    }

    public static function form(Form $form): Form
{
    return $form->schema([
        Forms\Components\Section::make('Información del Evento')
            ->schema([
                Forms\Components\DateTimePicker::make('created_at')
                    ->label('Fecha y Hora')
                    ->disabled(),
                Forms\Components\TextInput::make('usuario_nombre')
                    ->label('Realizado por')
                    ->formatStateUsing(fn (BitacoraEvento $record) => $record->usuario?->name ?? 'Sistema')
                    ->disabled(),
                Forms\Components\TextInput::make('accion')
                    ->label('Operación realizada')
                    ->disabled(),
                Forms\Components\TextInput::make('entidad_tipo')
                    ->label('Módulo afectado')
                    ->disabled(),
            ])->columns(2),

        Forms\Components\Section::make('Datos de la Transacción')
            ->schema([
                // PASO 8: JSON Pretty Print con fuente monoespaciada
                Forms\Components\Textarea::make('datos_extras')
                    ->label('Contenido del cambio (JSON)')
                    ->formatStateUsing(fn ($state) => is_array($state) 
                        ? json_encode($state, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) 
                        : $state
                    )
                    ->disabled()
                    ->rows(10)
                    ->fontFamily('mono')
                    ->columnSpanFull()
                    ->extraAttributes(['style' => 'background-color: #f8fafc; color: #1e293b;']),
            ])
    ]);
}

    public static function table(Table $table): Table
{
    return $table
        ->defaultSort('created_at', 'desc')
        ->columns([
            Tables\Columns\TextColumn::make('created_at')
                ->label('Fecha')
                ->dateTime('d/m/Y H:i')
                ->sortable(),

            Tables\Columns\TextColumn::make('usuario.name')
                ->label('Usuario')
                ->searchable()
                ->sortable(),

            Tables\Columns\TextColumn::make('accion')
                ->label('Acción')
                ->badge()
                // Colores para las acciones (Paso 8 - Visual)
                ->color(fn (string $state): string => match ($state) {
                    'crear' => 'gray',
                    'aprobar' => 'success',
                    'rechazar' => 'danger',
                    'cancelar' => 'warning',
                    'enviar', 'observar' => 'info',
                    default => 'gray',
                })
                ->sortable(),

            Tables\Columns\TextColumn::make('entidad_tipo')
                ->label('Módulo / Entidad')
                // PASO 7: Mapeo de nombres técnicos a nombres amigables
                ->formatStateUsing(fn (string $state): string => match ($state) {
                    'solicitud_transporte' => '🚐 Transporte',
                    'solicitud_combustible' => '⛽ Combustible',
                    'solicitud_mantenimiento' => '🛠 Mantenimiento',
                    default => $state,
                })
                ->searchable()
                ->sortable(),

            Tables\Columns\TextColumn::make('entidad_id')
                ->label('ID Ref.')
                ->fontFamily('mono')
                ->sortable(),

            Tables\Columns\TextColumn::make('datos_extras')
                ->label('Detalles Técnicos')
                ->limit(30)
                ->toggleable(isToggledHiddenByDefault: true),
        ])
        ->filters([
            Tables\Filters\SelectFilter::make('accion')
                ->label('Acción')
                ->options([
                    'crear' => 'Crear',
                    'enviar' => 'Enviar',
                    'aprobar' => 'Aprobar',
                    'rechazar' => 'Rechazar',
                    'cancelar' => 'Cancelar',
                    'observar' => 'Observar',
                ]),
            
            // PASO 7: Filtro con nombres amigables
            Tables\Filters\SelectFilter::make('entidad_tipo')
                ->label('Módulo')
                ->options([
                    'solicitud_transporte' => 'Transporte',
                    'solicitud_combustible' => 'Combustible',
                    'solicitud_mantenimiento' => 'Mantenimiento',
                ]),
        ])
            ->actions([
                Tables\Actions\ViewAction::make(),
            ])
            ->bulkActions([]);
    }

    //Agregado
    public static function getEloquentQuery(): Builder
    {
      return parent::getEloquentQuery()->with('usuario');
    }


    public static function getPages(): array
    {
        return [
            'index' => Pages\ListBitacoraEventos::route('/'),
            'view'  => Pages\ViewBitacoraEvento::route('/{record}'),
        ];
    }
}