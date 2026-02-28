<?php
namespace App\Filament\Resources;

use App\Filament\Resources\SerieValeResource\Pages;
use App\Models\SerieVale;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class SerieValeResource extends Resource
{
    protected static ?string $model = SerieVale::class;
    protected static ?string $navigationGroup = 'Catálogos Globales';
    protected static ?string $navigationLabel = 'Serie de Vales';
    protected static ?string $navigationIcon  = 'heroicon-o-ticket';
    protected static ?int    $navigationSort  = 10;

    public static function canViewAny(): bool  { return auth()->user()->hasAnyRole(['superadmin', 'admin', 'ti', 'jefe']); }
    public static function canCreate(): bool   { return auth()->user()->hasAnyRole(['superadmin', 'admin', 'ti', 'jefe']); }
    public static function canEdit($r): bool   { return auth()->user()->hasAnyRole(['superadmin', 'admin', 'ti', 'jefe']); }
    public static function canDelete($r): bool { return auth()->user()->hasAnyRole(['superadmin', 'admin', 'jefe']); }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Información de la Serie')->schema([
                Forms\Components\TextInput::make('nombre')
                    ->label('Nombre')->required()->maxLength(100)->columnSpan(2),
                Forms\Components\TextInput::make('valor')
                    ->label('Valor del Vale ($)')->numeric()->required()->prefix('$'),
                Forms\Components\TextInput::make('valor_compra')
                    ->label('Valor de Compra ($)')->numeric()->prefix('$'),
                Forms\Components\DatePicker::make('fecha_emision')
                    ->label('Fecha Emisión')->required(),
                Forms\Components\DatePicker::make('fecha_vencimiento')
                    ->label('Fecha Vencimiento')->required(),
                Forms\Components\DatePicker::make('fecha_recibido')
                    ->label('Fecha Recibido')->required(),
                Forms\Components\Toggle::make('activo')
                    ->label('Activo')->default(true),
            ])->columns(2),

            Forms\Components\Section::make('Correlativos')->schema([
                Forms\Components\TextInput::make('correlativo_inicio')
                    ->label('Correlativo Inicio')->numeric()->required(),
                Forms\Components\TextInput::make('correlativo_fin')
                    ->label('Correlativo Fin')->numeric()->required(),
                Forms\Components\TextInput::make('cantidad')
                    ->label('Cantidad de Vales')->numeric()->required(),
                Forms\Components\Textarea::make('observaciones')
                    ->label('Observaciones')->columnSpan(3),
            ])->columns(3),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('fecha_emision', 'desc')
            ->columns([
                Tables\Columns\TextColumn::make('nombre')
                    ->label('Serie')->searchable()->sortable()->weight('bold')
                    ->wrap(),
                Tables\Columns\TextColumn::make('valor')
                    ->label('Valor')->money('USD')->sortable(),
                Tables\Columns\TextColumn::make('cantidad')
                    ->label('Cantidad')->numeric()->sortable(),
                Tables\Columns\TextColumn::make('fecha_emision')
                    ->label('Emisión')->date('d/m/Y')->sortable(),
                Tables\Columns\TextColumn::make('fecha_vencimiento')
                    ->label('Vencimiento')->date('d/m/Y')->sortable()
                    ->color(fn ($record) => $record->fecha_vencimiento < now() ? 'danger' : 'success'),
                Tables\Columns\IconColumn::make('activo')->label('Activo')->boolean(),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('activo')->label('Estado'),
            ])
            ->actions([
                Tables\Actions\EditAction::make()->button()->size('sm'),
                Tables\Actions\DeleteAction::make()->button()->size('sm'),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListSerieVales::route('/'),
            'create' => Pages\CreateSerieVale::route('/create'),
            'edit'   => Pages\EditSerieVale::route('/{record}/edit'),
        ];
    }
}