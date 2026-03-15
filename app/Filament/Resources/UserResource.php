<?php

namespace App\Filament\Resources;

use Illuminate\Support\Facades\Hash;
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
use PhpParser\Node\Stmt\Label;
use Spatie\Permission\Models\Role;

class UserResource extends Resource
{
    protected static ?string $model = User::class;

    protected static ?string $navigationIcon = 'heroicon-o-shield-check';
    protected static ?string $navigationGroup = 'Administracion';
    protected static ?int $navigationSort = 1;
    protected static ?string $navigationLabel = 'Usuarios';

    
    //Restricciones de acceso a la gestión de usuarios
    public static function canViewAny(): bool
{
    $u = auth()->user();
    
    // Verifica en Tinker si el nombre es 'super_admin' o 'super-admin'
    return $u?->hasAnyRole(['super_admin', 'ti', 'admin']) ?? false;
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
                            // Encripta la contraseña antes de guardarla
                            ->dehydrateStateUsing(fn ($state) => \Illuminate\Support\Facades\Hash::make($state))
                            // Solo guarda si el campo no está vacío (útil al editar)
                            ->dehydrated(fn ($state) => filled($state))
                            ->required(fn ($context) => $context === 'create')
                            ->helperText('Dejar en blanco para mantener la contraseña actual')
                            ->minLength(9),

                        Forms\Components\Select::make('roles')
                            ->label('Roles')
                            ->relationship('roles', 'name')
                            ->multiple()
                            ->searchable()
                            ->preload()
                            ->helperText('Seleccioná uno o varios roles.'),
                    ])
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->label('Nombre')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('email')
                    ->label('Correo')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\IconColumn::make('activo')
                    ->label('Activo')
                    ->boolean()
                    ->sortable(),

                Tables\Columns\TextColumn::make('roles.name')
                    ->label('Roles')
                    ->badge()
                    ->separator(',')
                    ->sortable(),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Creado')
                    ->dateTime('Y-m-d H:i')
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('activo')->label('Activo'),
                Tables\Filters\SelectFilter::make('role')
                    ->label('Rol')
                    ->options(fn () => Role::query()->orderBy('name')->pluck('name', 'name')->toArray())
                    ->query(function (Builder $query, array $data) {
                        if (empty($data['value'])) return $query;
                        return $query->whereHas('roles', fn ($q) => $q->where('name', $data['value']));
                    }),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\Action::make('toggleActivo')
                    ->label(fn (User $record) => $record->activo ? 'Desactivar' : 'Activar')
                    ->icon('heroicon-o-power')
                    ->color(fn (User $record) => $record->activo ? 'danger' : 'success')
                    ->requiresConfirmation()
                    ->action(function (User $record) {
                        $record->update(['activo' => !$record->activo]);
                    }),
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
