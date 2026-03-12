<x-filament-panels::page>
    <div class="space-y-6">

        {{ $this->form }}

        <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
            <x-filament::section>
                <div class="text-sm text-gray-500">Total</div>
                <div class="text-2xl font-semibold">{{ $kpi_total }}</div>
            </x-filament::section>

            <x-filament::section>
                <div class="text-sm text-gray-500">Transporte</div>
                <div class="text-2xl font-semibold">{{ $kpi_transporte }}</div>
            </x-filament::section>

            <x-filament::section>
                <div class="text-sm text-gray-500">Combustible</div>
                <div class="text-2xl font-semibold">{{ $kpi_combustible }}</div>
            </x-filament::section>

            <x-filament::section>
                <div class="text-sm text-gray-500">Mantenimiento</div>
                <div class="text-2xl font-semibold">{{ $kpi_mantenimiento }}</div>
            </x-filament::section>
        </div>

        <x-filament::section>
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="border-b">
                        <tr class="text-left">
                            <th class="py-3 pr-4">Tipo</th>
                            <th class="py-3 pr-4">Código</th>
                            <th class="py-3 pr-4">Fecha ingreso</th>
                            <th class="py-3 pr-4">Solicitante</th>
                            <th class="py-3 pr-4">Unidad</th>
                            <th class="py-3 pr-4">Detalle</th>
                            <th class="py-3 pr-4">Prioridad</th>
                            <th class="py-3 pr-4">Estado</th>
                            <th class="py-3 pr-4">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse ($this->paginatedRows as $row)
                            <tr class="border-b align-top">
                                <td class="py-3 pr-4">{{ ucfirst($row['tipo']) }}</td>
                                <td class="py-3 pr-4 font-mono">{{ $row['codigo'] }}</td>
                                <td class="py-3 pr-4">
                                    {{ $row['fecha_ingreso'] ? \Carbon\Carbon::parse($row['fecha_ingreso'])->format('d/m/Y H:i') : '—' }}
                                </td>
                                <td class="py-3 pr-4">{{ $row['solicitante'] }}</td>
                                <td class="py-3 pr-4">{{ $row['unidad'] }}</td>
                                <td class="py-3 pr-4">{{ $row['detalle'] }}</td>
                                <td class="py-3 pr-4">{{ strtoupper($row['prioridad']) }}</td>
                                <td class="py-3 pr-4">
                                    <span class="fi-badge fi-color-gray">
                                        {{ ucfirst(str_replace('_', ' ', $row['estado'])) }}
                                    </span>
                                </td>
                                <td class="py-3 pr-4">
                                    <div class="flex flex-col gap-2">
                                        @if($row['estado'] === 'pendiente')
                                            <x-filament::button
                                                size="sm"
                                                wire:click="tomarParaRevision('{{ $row['tipo'] }}', {{ $row['id'] }})"
                                            >
                                                Tomar revisión
                                            </x-filament::button>
                                        @endif

                                        <div class="flex gap-2">
                                            <x-filament::button
                                                size="sm"
                                                color="gray"
                                                wire:click="cambiarPrioridad('{{ $row['tipo'] }}', {{ $row['id'] }}, 'alta')"
                                            >
                                                Alta
                                            </x-filament::button>

                                            <x-filament::button
                                                size="sm"
                                                color="gray"
                                                wire:click="cambiarPrioridad('{{ $row['tipo'] }}', {{ $row['id'] }}, 'media')"
                                            >
                                                Media
                                            </x-filament::button>

                                            <x-filament::button
                                                size="sm"
                                                color="gray"
                                                wire:click="cambiarPrioridad('{{ $row['tipo'] }}', {{ $row['id'] }}, 'baja')"
                                            >
                                                Baja
                                            </x-filament::button>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="9" class="py-6 text-center text-gray-500">
                                    No hay solicitudes en bandeja operativa.
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

            <div class="mt-4">
                {{ $this->paginatedRows->links() }}
            </div>
        </x-filament::section>

    </div>
</x-filament-panels::page>