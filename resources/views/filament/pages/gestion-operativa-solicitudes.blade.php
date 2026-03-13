<x-filament-panels::page>
    <div class="space-y-6">
        {{-- Header y Títulos --}}
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm gap-4">
            <div>
                <h1 class="text-2xl font-bold tracking-tight text-gray-950 dark:text-white">Gestión Operativa de Solicitudes</h1>
                <p class="text-gray-500 text-sm font-medium">{{ $this->etapaLabel() }}</p>
            </div>
            <div class="flex gap-2">
                <x-filament::button color="gray" size="sm" icon="heroicon-m-calendar" wire:click="setMesActual" outline>Mes Actual</x-filament::button>
                <x-filament::button color="gray" size="sm" icon="heroicon-m-arrow-path" wire:click="limpiarFiltros" outline>Limpiar</x-filament::button>
            </div>
        </div>

        {{-- Selector de Etapa (Tabs) --}}
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            @foreach(['bandeja' => ['Bandeja Entrada', 'heroicon-m-inbox-stack'], 'revision' => ['En Revisión', 'heroicon-m-magnifying-glass-circle'], 'aprobaciones' => ['Por Aprobar', 'heroicon-m-shield-check']] as $key => $val)
                <button wire:click="cambiarEtapa('{{ $key }}')" 
                    @class([
                        'flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200',
                        'border-primary-500 bg-primary-50 dark:bg-primary-950/20 text-primary-600 shadow-sm' => $etapa === $key,
                        'border-gray-100 bg-white dark:bg-white/5 text-gray-500 hover:border-gray-300 dark:hover:border-white/20' => $etapa !== $key,
                    ])>
                    <x-filament::icon :icon="$val[1]" class="h-6 w-6" />
                    <span class="font-bold uppercase tracking-wide text-xs">{{ $val[0] }}</span>
                </button>
            @endforeach
        </div>

        {{-- Filtros y Resumen KPI --}}
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div class="lg:col-span-3 bg-white dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
                {{ $this->form }}
            </div>
            <div class="grid grid-cols-2 gap-2">
                <div class="bg-primary-600 text-white p-4 rounded-xl shadow-md flex flex-col items-center justify-center">
                    <span class="text-[10px] uppercase font-bold opacity-80">Total Etapa</span>
                    <span class="text-3xl font-black">{{ $kpi_total }}</span>
                </div>
                <div class="bg-gray-900 dark:bg-white/10 text-white p-4 rounded-xl shadow-md flex flex-col items-center justify-center">
                    <span class="text-[10px] uppercase font-bold opacity-60 italic">Distribución</span>
                    <span class="text-sm font-mono font-bold">{{ $kpi_a }} | {{ $kpi_b }} | {{ $kpi_c }}</span>
                </div>
            </div>
        </div>

        {{-- Listado de Items --}}
        <div class="grid grid-cols-1 gap-4">
            @forelse ($this->paginatedRows as $row)
                <div class="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm hover:border-primary-400 dark:hover:border-primary-500 transition-all">
                    <div class="p-5 flex flex-col lg:flex-row justify-between gap-6">
                        <div class="flex-1 space-y-3">
                            <div class="flex items-center gap-3">
                                <span class="px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-[10px] font-bold uppercase tracking-tighter border border-primary-200">
                                    {{ $row['tipo'] }}
                                </span>
                                <span class="text-sm font-mono font-bold text-gray-400">#{{ $row['codigo'] }}</span>
                                <span class="text-xs text-gray-400 flex items-center gap-1">
                                    <x-heroicon-m-clock class="h-3 w-3" />
                                    {{ \Carbon\Carbon::parse($row['fecha_ingreso'])->diffForHumans() }}
                                </span>
                            </div>
                            <div>
                                <h3 class="font-bold text-gray-950 dark:text-white text-lg tracking-tight">{{ $row['solicitante'] }}</h3>
                                <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{{ Str::limit($row['detalle'], 150) }}</p>
                            </div>
                        </div>

                        {{-- Panel de Acciones --}}
                        <div class="flex items-center gap-2 bg-gray-50 dark:bg-white/5 p-4 rounded-2xl min-w-[220px] justify-center border border-gray-100 dark:border-transparent">
                            @if($etapa === 'bandeja')
                                <x-filament::button 
                                    size="sm" 
                                    icon="heroicon-m-hand-raised" 
                                    wire:click="tomarParaRevision('{{ $row['tipo'] }}', {{ $row['id'] }})"
                                    wire:loading.attr="disabled"
                                    class="shadow-sm"
                                >
                                    Tomar Solicitud
                                </x-filament::button>
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
                <div class="flex flex-col items-center justify-center py-20 bg-gray-50 dark:bg-white/5 rounded-3xl border-2 border-dashed border-gray-200 dark:border-white/10">
                    <x-heroicon-o-circle-stack class="h-12 w-12 text-gray-300 mb-4" />
                    <p class="text-gray-500 font-medium">No se encontraron solicitudes pendientes en esta etapa.</p>
                </div>
            @endforelse
        </div>

        {{-- Paginación --}}
        <div class="mt-6">
            {{ $this->paginatedRows->links() }}
        </div>
    </div>

    {{-- Requerido para que los modales de Actions funcionen --}}
    <x-filament-actions::modals />
</x-filament-panels::page>