<?php

namespace App\Filament\Resources;

use App\Filament\Resources\UnidadSolicitanteResource\Pages;
use App\Models\UnidadSolicitante;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class UnidadSolicitanteResource extends Resource
{
    protected static ?string $model = UnidadSolicitante::class;
    protected static ?string $navigationGroup = 'Catálogos Globales';
    protected static ?string $navigationLabel = 'Unidades Solicitantes';
    protected static ?string $navigationIcon  = 'heroicon-o-building-office-2';
    protected static ?int    $navigationSort  = 12;

    public static function canViewAny(): bool  { return auth()->user()->hasAnyRole(['superadmin', 'admin', 'ti', 'jefe']); }
    public static function canCreate(): bool   { return auth()->user()->hasAnyRole(['superadmin', 'admin', 'ti', 'jefe']); }
    public static function canEdit($r): bool   { return auth()->user()->hasAnyRole(['superadmin', 'admin', 'ti', 'jefe']); }
    public static function canDelete($r): bool { return auth()->user()->hasAnyRole(['superadmin', 'admin']); }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Identificación')
                ->icon('heroicon-o-building-office-2')
                ->schema([
                    Forms\Components\TextInput::make('codigo')
                        ->label('Código')
                        ->maxLength(20)
                        ->placeholder('Ej: 010307')
                        ->fontFamily('mono'),

                    Forms\Components\TextInput::make('siglas')
                        ->label('Siglas')
                        ->maxLength(20)
                        ->placeholder('Ej: DPTO. TRANS.'),

                    Forms\Components\TextInput::make('nombre')
                        ->label('Nombre')
                        ->required()
                        ->maxLength(300)
                        ->placeholder('Ej: DEPARTAMENTO DE TRANSPORTE')
                        ->columnSpan(2),

                    Forms\Components\Textarea::make('descripcion')
                        ->label('Descripción')
                        ->maxLength(300)
                        ->rows(2)
                        ->columnSpan(2),
                ])->columns(2),

            Forms\Components\Section::make('Configuración')
                ->icon('heroicon-o-cog-6-tooth')
                ->schema([
                    Forms\Components\Toggle::make('estado')
                        ->label('Activo')
                        ->default(true),

                    Forms\Components\Toggle::make('puede_solicitar_transporte')
                        ->label('Puede solicitar transporte')
                        ->default(true)
                        ->helperText('Indica si esta unidad puede generar solicitudes de transporte.'),
                ])->columns(2),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('nombre')
            ->columns([
                Tables\Columns\TextColumn::make('codigo')
                    ->label('Código')
                    ->searchable()
                    ->sortable()
                    ->fontFamily('mono')
                    ->badge()
                    ->color('gray'),

                Tables\Columns\TextColumn::make('nombre')
                    ->label('Nombre')
                    ->searchable()
                    ->sortable()
                    ->weight('bold')
                    ->description(fn ($record) => $record->descripcion),

                Tables\Columns\TextColumn::make('siglas')
                    ->label('Siglas')
                    ->searchable()
                    ->placeholder('—')
                    ->badge()
                    ->color('primary'),

                Tables\Columns\TextColumn::make('solicitudes_count')
                    ->label('Solicitudes')
                    ->counts('solicitudes')
                    ->badge()
                    ->color('info'),

                Tables\Columns\IconColumn::make('puede_solicitar_transporte')
                    ->label('Puede Solicitar')
                    ->boolean()
                    ->trueIcon('heroicon-o-check-circle')
                    ->falseIcon('heroicon-o-x-circle')
                    ->trueColor('success')
                    ->falseColor('danger'),

                Tables\Columns\IconColumn::make('estado')
                    ->label('Activo')
                    ->boolean()
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('estado')
                    ->label('Activo'),
                Tables\Filters\TernaryFilter::make('puede_solicitar_transporte')
                    ->label('Puede Solicitar Transporte'),
            ])
            ->actions([
                Tables\Actions\EditAction::make()->button()->size('sm')->color('warning'),
                Tables\Actions\DeleteAction::make()->button()->size('sm')
                    ->before(function ($record, $action) {
                        if ($record->solicitudes_count > 0) {
                            $action->cancel();
                            \Filament\Notifications\Notification::make()
                                ->title('No se puede eliminar')
                                ->body('Esta unidad tiene solicitudes registradas.')
                                ->danger()
                                ->send();
                        }
                    }),
            ])
            ->bulkActions([]);
    }

    public static function getEloquentQuery(): \Illuminate\Database\Eloquent\Builder
    {
        return parent::getEloquentQuery()->withCount('solicitudes');
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListUnidadSolicitantes::route('/'),
            'create' => Pages\CreateUnidadSolicitante::route('/create'),
            'edit'   => Pages\EditUnidadSolicitante::route('/{record}/edit'),
        ];
    }
}