<x-filament-panels::page>
    <div class="space-y-6">
        {{-- Header dinámico --}}
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm gap-4">
            <div>
                <h1 class="text-2xl font-bold">Gestión de Solicitudes</h1>
                <p class="text-gray-500 text-sm">{{ $this->etapaLabel() }}</p>
            </div>
            <div class="flex gap-2">
                <x-filament::button color="gray" size="sm" icon="heroicon-m-calendar" wire:click="setMesActual">Mes Actual</x-filament::button>
                <x-filament::button color="gray" size="sm" icon="heroicon-m-arrow-path" wire:click="limpiarFiltros">Limpiar</x-filament::button>
            </div>
        </div>

        {{-- Selector de Etapa Estilo Tabs --}}
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            @foreach(['bandeja' => ['Recepción', 'heroicon-m-inbox'], 'revision' => ['Revisión', 'heroicon-m-clipboard-document-check'], 'aprobaciones' => ['Aprobación', 'heroicon-m-check-badge']] as $key => $val)
                <button wire:click="cambiarEtapa('{{ $key }}')" 
                    @class([
                        'flex items-center gap-3 p-4 rounded-xl border-2 transition-all',
                        'border-primary-500 bg-primary-50 dark:bg-primary-950/20 text-primary-600' => $etapa === $key,
                        'border-gray-100 bg-white dark:bg-white/5 text-gray-500 hover:border-gray-200' => $etapa !== $key,
                    ])>
                    <x-filament::icon :icon="$val[1]" class="h-6 w-6" />
                    <span class="font-bold">{{ $val[0] }}</span>
                </button>
            @endforeach
        </div>

        {{-- Filtros y KPIs --}}
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div class="lg:col-span-3 bg-white dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-white/10">
                {{ $this->form }}
            </div>
            <div class="grid grid-cols-2 gap-2">
                <div class="bg-primary-500 text-white p-4 rounded-xl shadow-sm text-center">
                    <div class="text-xs uppercase opacity-80">Total</div>
                    <div class="text-2xl font-black">{{ $kpi_total }}</div>
                </div>
                <div class="bg-gray-800 text-white p-4 rounded-xl shadow-sm text-center">
                    <div class="text-xs uppercase opacity-80">Tipos</div>
                    <div class="text-sm font-bold">{{ $kpi_a }} / {{ $kpi_b }} / {{ $kpi_c }}</div>
                </div>
            </div>
        </div>

        {{-- Listado de Solicitudes --}}
        <div class="space-y-4">
            @forelse ($this->paginatedRows as $row)
                <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div class="p-5 flex flex-col lg:flex-row justify-between gap-6">
                        <div class="flex-1 space-y-3">
                            <div class="flex items-center gap-3">
                                <span class="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-[10px] font-bold uppercase tracking-wider">{{ $row['tipo'] }}</span>
                                <span class="text-sm font-mono font-bold text-primary-600">{{ $row['codigo'] }}</span>
                                <span class="text-gray-300">|</span>
                                <span class="text-xs text-gray-500">{{ \Carbon\Carbon::parse($row['fecha_ingreso'])->diffForHumans() }}</span>
                            </div>
                            <div>
                                <h3 class="font-bold text-gray-900 dark:text-white">{{ $row['solicitante'] }}</h3>
                                <p class="text-sm text-gray-500 line-clamp-2">{{ $row['detalle'] }}</p>
                            </div>
                        </div>

                        {{-- Botones de Acción (Llaman a las Actions de la Clase) --}}
                        <div class="flex items-center gap-2 bg-gray-50 dark:bg-white/5 p-3 rounded-xl min-w-[200px] justify-center">
                            @if($etapa === 'bandeja')
                                <x-filament::button size="sm" icon="heroicon-m-hand-raised" wire:click="tomarParaRevision('{{ $row['tipo'] }}', {{ $row['id'] }})">Tomar</x-filament::button>
                            @endif

                            @if($etapa === 'revision')
                                {{ ($this->validarAction)(['tipo' => $row['tipo'], 'id' => $row['id']]) }}
                                {{ ($this->derivarAction)(['tipo' => $row['tipo'], 'id' => $row['id']]) }}
                            @endif

                            @if($etapa === 'aprobaciones')
                                {{ ($this->aprobarAction)(['tipo' => $row['tipo'], 'id' => $row['id']]) }}
                            @endif
                        </div>
                    </div>
                </div>
            @empty
                <div class="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <p class="text-gray-400 font-medium">No hay solicitudes en esta etapa con los filtros aplicados.</p>
                </div>
            @endforelse
        </div>

        <div class="py-4">
            {{ $this->paginatedRows->links() }}
        </div>
    </div>

    {{-- Inicializador de Modales de Filament --}}
    <x-filament-actions::modals />
</x-filament-panels::page>