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
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                @foreach ($solicitudes as $solicitud)
                    <a href="{{ $solicitud['url'] }}"
                       class="block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">

                        {{-- Header con módulo y estado --}}
                        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">

                            {{-- Módulo badge --}}
                            <span @class([
                                'inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full',
                                'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'   => $solicitud['modulo'] === 'Transporte',
                                'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' => $solicitud['modulo'] === 'Mantenimiento',
                                'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' => $solicitud['modulo'] === 'Combustible',
                            ])>
                                @if ($solicitud['modulo'] === 'Transporte')
                                    <x-heroicon-m-truck class="w-3 h-3" />
                                @elseif ($solicitud['modulo'] === 'Mantenimiento')
                                    <x-heroicon-m-wrench-screwdriver class="w-3 h-3" />
                                @else
                                    <x-heroicon-m-fire class="w-3 h-3" />
                                @endif
                                {{ $solicitud['modulo'] }}
                            </span>

                            {{-- Estado badge --}}
                            <span @class([
                                'inline-flex text-xs font-semibold px-2 py-1 rounded-full',
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
                        </div>

                        {{-- Cuerpo --}}
                        <div class="px-4 py-3 space-y-1">
                            <p class="text-sm font-bold text-gray-900 dark:text-white font-mono">
                                {{ $solicitud['codigo'] }}
                            </p>
                            <p class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <x-heroicon-m-user class="w-3 h-3" />
                                {{ $solicitud['solicitante'] }}
                            </p>
                            <p class="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                                <x-heroicon-m-calendar class="w-3 h-3" />
                                {{ $solicitud['fecha'] }}
                            </p>
                        </div>

                        {{-- Footer --}}
                        <div class="px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700">
                            <span class="text-xs text-primary-600 dark:text-primary-400 font-medium flex items-center gap-1">
                                <x-heroicon-m-eye class="w-3 h-3" />
                                Ver detalle
                            </span>
                        </div>

                    </a>
                @endforeach
            </div>
        @endif

    </x-filament::section>
</x-filament-widgets::widget>