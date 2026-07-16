<?php

// -----------------------------------------------------------------------------
// RECURSO PRINCIPAL PARA USUARIOS DEL SISTEMA
// -----------------------------------------------------------------------------
// Este archivo define la lógica para gestionar los usuarios que pueden acceder
// al sistema. Aquí se configuran los formularios, las tablas y las acciones
// relacionadas con los usuarios. Los comentarios están pensados para que
// cualquier ingeniero, incluso sin experiencia en Laravel o Filament, pueda
// entender cómo se administra la gestión de usuarios.

namespace App\Filament\Resources;

use App\Filament\Resources\UserResource\Pages;
use App\Models\User;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Spatie\Permission\Models\Role;

// Esta clase representa el "recurso" de Usuarios.
// Un recurso es una pantalla o módulo donde se pueden ver, crear y gestionar usuarios.
class UserResource extends Resource
{
    // Indica el modelo principal que representa un usuario en la base de datos.
    protected static ?string $model = User::class;

    // Icono visual para identificar este recurso en el menú.
    protected static ?string $navigationIcon = 'heroicon-o-shield-check';

    // Agrupa este recurso en el menú bajo "Administración".
    protected static ?string $navigationGroup = 'Administración';

    // Orden en el que aparece en el menú.
    protected static ?int $navigationSort = 1;

    // Nombre que aparece en el menú de navegación.
    protected static ?string $navigationLabel = 'Usuarios';

    // -------------------------------------------------------------------------
    // Controla quién puede ver la lista de usuarios.
    // Solo ciertos roles pueden acceder a la gestión de usuarios.
    public static function canViewAny(): bool
    {
        $u = auth()->user();

        // Solo los usuarios con rol de super_admin, ti o admin pueden ver este recurso.
        return $u?->hasAnyRole(['super_admin', 'ti', 'admin']) ?? false;
    }

    // -------------------------------------------------------------------------
    // FORMULARIO PRINCIPAL
    // -------------------------------------------------------------------------
    // Aquí se define cómo se ve y se comporta el formulario para crear o editar
    // un usuario. Cada campo tiene validaciones y explicaciones para el usuario.
    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                // Sección de datos principales del usuario
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
                        // Selección de la unidad a la que pertenece el usuario
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

                        Forms\Components\Select::make('grupo_id')
                            ->label('Grupo')
                            ->relationship('grupo', 'nombre')
                            ->options(fn () => \App\Models\Grupo::activos()->pluck('nombre', 'id'))
                            ->searchable()
                            ->preload()
                            ->nullable()
                            ->visible(fn () => auth()->user()->hasAnyRole(['admin', 'super_admin', 'ti', 'operativo'])
                            ),
                    ]),

                Forms\Components\Section::make('Seguridad')
                    ->columns(2)
                    ->schema([
                        Forms\Components\TextInput::make('password')
                            ->label('Contraseña')
                            ->password()
                            ->revealable()
    // ❌ Quitar esta línea — el cast 'hashed' del modelo ya hashea
    // ->dehydrateStateUsing(fn ($state) => \Illuminate\Support\Facades\Hash::make($state))
                            ->dehydrated(fn ($state) => filled($state))
                            ->required(fn ($context) => $context === 'create')
                            ->helperText('Dejar en blanco para mantener la contraseña actual')
                            ->minLength(9),

                        Forms\Components\Select::make('roles')
                            ->label('Roles')
                            ->multiple()
                            ->searchable()
                            ->preload()
                            ->options(
                                \Spatie\Permission\Models\Role::where('guard_name', 'web')
                                    ->pluck('name', 'name') // clave = nombre, valor = nombre
                            )
                            ->afterStateHydrated(function ($component, $record) {
                                if ($record) {
                                    $component->state($record->roles->pluck('name')->toArray());
                                }
                            })
                            ->saveRelationshipsUsing(function ($record, $state) {
                                $record->syncRoles($state ?? []);
                            })
                            ->helperText('Seleccioná uno o varios roles.'),
                    ]),
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

                Tables\Columns\TextColumn::make('grupo.nombre')
                    ->label('Grupo')
                    ->sortable()
                    ->searchable()
                    ->badge()
                    ->color(fn ($record) => $record->grupo?->color() ?? 'gray'),

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
                        if (empty($data['value'])) {
                            return $query;
                        }

                        return $query->whereHas('roles', fn ($q) => $q->where('name', $data['value']));
                    }),
                Tables\Filters\SelectFilter::make('grupo')
                    ->label('Grupo')
                    ->relationship('grupo', 'nombre')
                    ->searchable()
                    ->preload(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\Action::make('toggleActivo')
                    ->label(fn (User $record) => $record->activo ? 'Desactivar' : 'Activar')
                    ->icon('heroicon-o-power')
                    ->color(fn (User $record) => $record->activo ? 'danger' : 'success')
                    ->requiresConfirmation()
                    ->action(function (User $record) {
                        $record->update(['activo' => ! $record->activo]);
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
