<x-filament-widgets::widget>
    <x-filament::section>
        <x-slot name="heading">
            Bandeja de Aprobaciones
        </x-slot>

        @php $solicitudes = $this->getSolicitudes(); @endphp

        @if ($solicitudes->isEmpty())
            <div class="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
                <x-heroicon-o-check-circle class="w-12 h-12 mb-3" />
                <p class="text-sm font-medium">No hay solicitudes pendientes</p>
            </div>
        @else
            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                @foreach ($solicitudes as $solicitud)
                    <a href="{{ $solicitud['url'] }}"
                       class="flex items-stretch bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm active:scale-[0.98] hover:shadow-md transition-all duration-150 overflow-hidden w-full">

                        {{-- Franja lateral --}}
                        <div @class([
                            'w-1.5 shrink-0',
                            'bg-blue-500'   => $solicitud['modulo'] === 'Transporte',
                            'bg-orange-500' => $solicitud['modulo'] === 'Mantenimiento',
                            'bg-green-500'  => $solicitud['modulo'] === 'Combustible',
                        ])></div>

                        {{-- Contenido --}}
                        <div class="flex flex-1 items-center gap-3 px-3 py-3 min-w-0 w-full">

                            {{-- Ícono --}}
                            <div @class([
                                'shrink-0 flex items-center justify-center w-9 h-9 rounded-lg',
                                'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300'         => $solicitud['modulo'] === 'Transporte',
                                'bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-300' => $solicitud['modulo'] === 'Mantenimiento',
                                'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-300'     => $solicitud['modulo'] === 'Combustible',
                            ])>
                                @if ($solicitud['modulo'] === 'Transporte')
                                    <x-heroicon-m-truck class="w-5 h-5" />
                                @elseif ($solicitud['modulo'] === 'Mantenimiento')
                                    <x-heroicon-m-wrench-screwdriver class="w-5 h-5" />
                                @else
                                    <x-heroicon-m-fire class="w-5 h-5" />
                                @endif
                            </div>

                            {{-- Texto --}}
                            <div class="flex-1 min-w-0">
                                <p class="text-sm font-bold text-gray-900 dark:text-white font-mono truncate">
                                    {{ $solicitud['codigo'] }}
                                </p>
                                <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {{ $solicitud['solicitante'] }}
                                </p>
                                <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                    {{ $solicitud['fecha'] }}
                                </p>
                            </div>

                            {{-- Estado + chevron --}}
                            <div class="shrink-0 flex flex-col items-end gap-2">
                                <span @class([
                                    'inline-flex text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap',
                                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' => $solicitud['estado'] === 'pendiente',
                                    'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'         => $solicitud['estado'] === 'en_revision',
                                    'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' => $solicitud['estado'] === 'pre_aprobada',
                                ])>
                                    {{ match($solicitud['estado']) {
                                        'pendiente'    => 'Pendiente',
                                        'en_revision'  => 'En Revisión',
                                        'pre_aprobada' => 'Pre-Aprobada',
                                        default        => ucfirst($solicitud['estado']),
                                    } }}
                                </span>
                                <x-heroicon-m-chevron-right class="w-4 h-4 text-gray-400 dark:text-gray-500" />
                            </div>

                        </div>
                    </a>
                @endforeach
            </div>
        @endif

    </x-filament::section>
</x-filament-widgets::widget>