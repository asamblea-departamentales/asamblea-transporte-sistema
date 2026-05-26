<?php
// -----------------------------------------------------------------------------
// RECURSO PRINCIPAL PARA TIPOS DE LICENCIA
// -----------------------------------------------------------------------------
// Administra las categorías de licencia de conducir, como
// "Liviana", "Pesada" o "Motocicleta". Se usa para clasificar
// a los motoristas según el tipo de licencia que poseen.
// Permite ver, crear, editar y eliminar tipos de licencia,
// y muestra cuántos motoristas están asignados a cada categoría.

namespace App\Filament\Resources;

use App\Filament\Resources\TipoLicenciaResource\Pages;
use App\Models\TipoLicencia;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class TipoLicenciaResource extends Resource
{
    protected static ?string $model = TipoLicencia::class;
    protected static ?string $navigationGroup = 'Catálogos Globales';
    protected static ?string $navigationLabel = 'Tipos de Licencia';
    protected static ?string $pluralModelLabel = 'Tipos de Licencia';
    protected static ?string $modelLabel = 'Tipo de Licencia';
    protected static ?string $navigationIcon  = 'heroicon-o-identification';
    protected static ?int    $navigationSort  = 11;

    public static function canViewAny(): bool  { return auth()->user()->hasAnyRole(['superadmin', 'admin', 'ti', 'jefe']); }
    public static function canCreate(): bool   { return auth()->user()->hasAnyRole(['superadmin', 'admin', 'ti', 'jefe']); }
    public static function canEdit($r): bool   { return auth()->user()->hasAnyRole(['superadmin', 'admin', 'ti', 'jefe']); }
    public static function canDelete($r): bool { return auth()->user()->hasAnyRole(['superadmin', 'admin']); }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Información')
                ->icon('heroicon-o-identification')
                ->schema([
                    Forms\Components\TextInput::make('nombre')
                        ->label('Nombre')
                        ->required()
                        ->maxLength(100)
                        ->placeholder('Ej: LIVIANA')
                        ->columnSpan(2),

                    Forms\Components\Toggle::make('activo')
                        ->label('Activo')
                        ->default(true)
                        ->columnSpan(2),
                ])->columns(2),
        ]);
    }

   public static function table(Table $table): Table
{
    return $table
        ->defaultSort('nombre')
        ->columns([
            Tables\Columns\TextColumn::make('nombre')
                ->label('Categoría de Licencia')
                ->searchable()
                ->sortable()
                ->weight('bold')
                ->size('lg')
                ->icon('heroicon-m-identification')
                ->color('primary'),

            Tables\Columns\TextColumn::make('motoristas_count')
                ->label('Personal Asignado')
                ->counts('motoristas')
                ->badge()
                ->color(fn ($state) => $state > 0 ? 'info' : 'gray')
                ->icon('heroicon-m-users')
                ->alignCenter(),

            // Usamos ToggleColumn para que puedas activar/desactivar licencias desde la lista
            Tables\Columns\ToggleColumn::make('activo')
                ->label('Estado')
                ->alignEnd(),
        ])
        ->filters([
            Tables\Filters\TernaryFilter::make('activo')
                ->label('Estado de Categoría'),
        ])
        ->actions([
            Tables\Actions\ActionGroup::make([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make()
                    ->before(function ($record, $action) {
                        if ($record->motoristas_count > 0) {
                            $action->cancel();
                            \Filament\Notifications\Notification::make()
                                ->title('Acción Bloqueada')
                                ->body('No puedes eliminar una licencia que ya está siendo usada por motoristas.')
                                ->danger()
                                ->send();
                        }
                    }),
            ])->button()->label('Acciones')->color('gray')
        ]);
}
    public static function getEloquentQuery(): \Illuminate\Database\Eloquent\Builder
    {
        return parent::getEloquentQuery()->withCount('motoristas');
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListTipoLicencias::route('/'),
            'create' => Pages\CreateTipoLicencia::route('/create'),
            'edit'   => Pages\EditTipoLicencia::route('/{record}/edit'),
        ];
    }
}