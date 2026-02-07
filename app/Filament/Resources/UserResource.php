<?php

namespace App\Filament\Resources;

use App\Filament\Resources\UserResource\Pages;
use App\Filament\Resources\UserResource\RelationManagers;
use App\Models\User;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class UserResource extends Resource
{
    protected static ?string $model = User::class;

    protected static ?string $navigationIcon = 'heroicon-o-shield-check';
    protected static ?string $navigationGroup = 'Administración';
    protected static ?int $navigationSort = 1;
    protected static ?string $navigationLabel = 'Usuarios';

    
    //Restricciones de acceso a la gestión de usuarios
    public static function canAccess(): bool
    {
        $u = auth()->user();
        return $u?->hasAnyRole(['superadmin', 'ti']) ?? false;
    }
    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                //Formulario para crear/editar usuarios, con validaciones
                Forms\Components\Section::make('Datos del usuario')
                ->columns(2)
                ->schema([
                    Forms\Components\TextInput::make('name')
                        ->label('Nombre')
                        ->required()
                        ->maxLength(150),

                    Forms\Components\TextInput::make('email')
                        ->label('Correo institucional')
                        ->required()
                        ->email()
                        ->maxLength(150)
                        ->unique(ignoreRecord: true),
                        
                    Forms\Components\Select::make('unidad_solicitante_id')
                        ->label('Unidad solicitante')
                        ->relationship('unidadSolicitante', 'nombre')
                        ->searchable()
                        ->preload()
                        ->required(),
                        
                    Forms\Components\Toggle::make('activo')
                        ->label('Activo')
                        ->default(true)
                        ->inline(false),
                ]), 
                
                Forms\Components\Section::make('Seguridad')
                ->columns(2)
                ->schema([
                    Forms\Components\TextInput::make('password')
                        ->label('Contraseña')
                        ->password()
                        ->revealable()
                        ->dehydrateStateUsing(fn ($state) => filled($state) ? $state : null)
                        ->dehydrated(fn ($state) => filled($state))
                        ->helperText('Dejar en blanco para mantener la contraseña actual')
                        ->minLength(8),
                ])
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                //
            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
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
            'index' => Pages\ListUsers::route('/'),
            'create' => Pages\CreateUser::route('/create'),
            'edit' => Pages\EditUser::route('/{record}/edit'),
        ];
    }
}
