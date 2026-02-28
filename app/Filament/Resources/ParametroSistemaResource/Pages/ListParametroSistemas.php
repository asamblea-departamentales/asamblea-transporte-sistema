<?php
namespace App\Filament\Resources\ParametroSistemaResource\Pages;

use App\Filament\Resources\ParametroSistemaResource;
use App\Models\ParametroSistema;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\Page;
use Livewire\Attributes\On;

class ListParametroSistemas extends Page
{
    protected static string $resource = ParametroSistemaResource::class;
    protected static string $view = 'filament.resources.parametros-sistema.list';
    protected static ?string $title = 'Parámetros del Sistema';

    public array $parametros = [];
    public array $editando   = [];

    public function mount(): void
    {
        $this->parametros = ParametroSistema::orderBy('id')->get()->toArray();
    }

    public function editar(int $id): void
    {
        $param = ParametroSistema::find($id);
        $this->editando[$id] = $param->valor;
    }

    public function guardar(int $id): void
    {
        ParametroSistema::where('id', $id)->update([
            'valor' => $this->editando[$id] ?? '',
        ]);

        unset($this->editando[$id]);
        $this->mount();

        Notification::make()
            ->title('Parámetro actualizado')
            ->success()
            ->send();
    }

    public function cancelar(int $id): void
    {
        unset($this->editando[$id]);
    }
}