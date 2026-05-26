<?php

// -----------------------------------------------------------------------------
// RECURSO PRINCIPAL PARA LOTES DE COMBUSTIBLE
// -----------------------------------------------------------------------------
// Este recurso administra los "lotes" o grupos de asignaciones de combustible.
// Aquí se crean lotes con una fecha y observaciones, y luego se asignan montos
// de combustible a vehículos dentro de cada lote. Los usuarios de operaciones
// pueden crear lotes, ver su estado (borrador, completado, etc.) y gestionarlos.

namespace App\Filament\Resources;

use App\Domain\Solicitudes\Enums\EstadoLoteEnum;
use App\Filament\Resources\AsignacionCombustibleLoteResource\Pages;
use App\Models\AsignacionCombustibleLote;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Model;

class AsignacionCombustibleLoteResource extends Resource
{
    protected static ?string $model = AsignacionCombustibleLote::class;

    protected static ?string $navigationGroup = 'Operatividad Diaria';

    protected static ?string $navigationLabel = 'Lotes de Combustible';

    protected static ?string $navigationIcon = 'heroicon-o-clipboard-document-list';

    protected static ?int $navigationSort = 1;

    protected static ?string $modelLabel = 'Lote';

    protected static ?string $pluralModelLabel = 'Lotes';

    public static function canViewAny(): bool
    {
        return auth()->user()->hasAnyRole(['admin', 'operativo', 'jefe', 'super_admin']);
    }

    public static function canCreate(): bool
    {
        return auth()->user()->hasAnyRole([
            'admin',
            'super_admin',
            'jefe',
        ]);
    }   

    public static function canEdit(Model $record): bool
    {
        return $record->estado === EstadoLoteEnum::BORRADOR
            && auth()->user()->hasAnyRole([
                'admin',
                'super_admin',
                'jefe',
            ]);
    }

    public static function canDelete(Model $record): bool
    {
        return $record->estado === EstadoLoteEnum::BORRADOR
            && auth()->user()->hasAnyRole([
                'admin',
                'super_admin',
                'jefe',
            ]);
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Información del Lote')
                    ->schema([
                        Forms\Components\DatePicker::make('fecha')
                            ->label('Fecha del Lote')
                            ->required()
                            ->default(now()->format('Y-m-d')),
                        Forms\Components\Textarea::make('observaciones')
                            ->label('Observaciones')
                            ->rows(3),
                    ])
                    ->columns(1),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('fecha', 'desc')
            ->columns([
                Tables\Columns\TextColumn::make('fecha')
                    ->label('Fecha del Lote')
                    ->date('d/m/Y')
                    ->sortable(),
                Tables\Columns\TextColumn::make('detalles_count')
                    ->label('Vehículos Asignados')
                    ->counts('detalles')
                    ->alignCenter(),
                Tables\Columns\TextColumn::make('total_monto')
                    ->label('Monto Total Asignado')
                    ->money('USD', true)
                    ->sortable(),
               Tables\Columns\TextColumn::make('estado')
                    ->label('Estado')
                    ->badge()
                    ->color(fn (EstadoLoteEnum $state) => $state->color())
                    ->formatStateUsing(fn (EstadoLoteEnum $state) => $state->label()),

                Tables\Columns\TextColumn::make('creador.name')
                    ->label('Creado Por')
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Fecha de Creación')
                    ->dateTime('d/m/Y H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('estado')
                    ->options(collect(EstadoLoteEnum::cases())
                        ->mapWithKeys(fn ($estado) => [$estado->value => ucfirst($estado->value)])),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make()->visible(fn ($record) => $record->estado === EstadoLoteEnum::BORRADOR),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListAsignacionCombustibleLotes::route('/'),

            'dashboard' => Pages\DashboardLotesCombustible::route('/dashboard'),

            'create' => Pages\CreateAsignacionCombustibleLote::route('/create'),

            'view' => Pages\ViewAsignacionCombustibleLote::route('/{record}'),

            'edit' => Pages\EditAsignacionCombustibleLote::route('/{record}/edit'),
        ];
    }  
}
