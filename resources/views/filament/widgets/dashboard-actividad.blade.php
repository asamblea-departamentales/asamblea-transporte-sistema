<x-filament-widgets::widget>
    <x-filament::section>
        <x-slot name="heading">Actividad reciente</x-slot>

        @php $items = $this->getData(); @endphp

        @if (empty($items))
            <div class="flex flex-col items-center justify-center py-8 text-gray-400 dark:text-gray-500">
                <x-heroicon-o-clock class="w-10 h-10 mb-2" />
                <p class="text-sm">Sin actividad reciente</p>
            </div>
        @else
            <div class="divide-y divide-gray-100 dark:divide-gray-700 -mx-1">
                @foreach ($items as $item)
                    <div class="flex items-center gap-3 px-1 py-2.5">

                        {{-- Ícono módulo --}}
                        <div @class([
                            'shrink-0 flex items-center justify-center w-8 h-8 rounded-lg',
                            'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300'         => $item['modulo'] === 'Transporte',
                            'bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-300' => $item['modulo'] === 'Mantenimiento',
                            'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-300'     => $item['modulo'] === 'Combustible',
                        ])>
                            @if ($item['modulo'] === 'Transporte')
                                <x-heroicon-m-truck class="w-4 h-4" />
                            @elseif ($item['modulo'] === 'Mantenimiento')
                                <x-heroicon-m-wrench-screwdriver class="w-4 h-4" />
                            @else
                                <x-heroicon-m-fire class="w-4 h-4" />
                            @endif
                        </div>

                        {{-- Texto --}}
                        <div class="flex-1 min-w-0">
                            <p class="text-xs font-bold text-gray-900 dark:text-white font-mono truncate">
                                {{ $item['codigo'] }}
                            </p>
                            <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {{ $item['solicitante'] }}
                            </p>
                        </div>

                        {{-- Estado + fecha --}}
                        <div class="shrink-0 flex flex-col items-end gap-1">
                            <span @class([
                                'inline-flex text-xs font-semibold px-1.5 py-0.5 rounded-full',
                                'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' => $item['estado'] === 'pendiente',
                                'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'         => $item['estado'] === 'en_revision',
                                'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' => $item['estado'] === 'pre_aprobada',
                                'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'     => $item['estado'] === 'aprobada',
                                'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'             => $item['estado'] === 'rechazada',
                                'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'         => !in_array($item['estado'], ['pendiente','en_revision','pre_aprobada','aprobada','rechazada']),
                            ])>
                                {{ match($item['estado']) {
                                    'pendiente'    => 'Pendiente',
                                    'en_revision'  => 'En Revisión',
                                    'pre_aprobada' => 'Pre-aprobada',
                                    'aprobada'     => 'Aprobada',
                                    'rechazada'    => 'Rechazada',
                                    default        => ucfirst($item['estado']),
                                } }}
                            </span>
                            <span class="text-xs text-gray-400 dark:text-gray-500">
                                {{ \Carbon\Carbon::parse($item['fecha'])->format('d/m H:i') }}
                            </span>
                        </div>

                    </div>
                @endforeach
            </div>
        @endif

    </x-filament::section>
</x-filament-widgets::widget>