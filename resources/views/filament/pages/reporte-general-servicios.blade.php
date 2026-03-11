<x-filament-panels::page>
    <div class="space-y-6">

        {{ $this->form }}

        <div class="grid grid-cols-1 gap-4 md:grid-cols-4 xl:grid-cols-7">
            <x-filament::section>
                <div class="text-sm text-gray-500">Total servicios</div>
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

            <x-filament::section>
                <div class="text-sm text-gray-500">Aprobadas / completadas</div>
                <div class="text-2xl font-semibold">{{ $kpi_aprobadas }}</div>
            </x-filament::section>

            <x-filament::section>
                <div class="text-sm text-gray-500">Rechazadas / canceladas</div>
                <div class="text-2xl font-semibold">{{ $kpi_rechazadas }}</div>
            </x-filament::section>

            <x-filament::section>
                <div class="text-sm text-gray-500">Monto total</div>
                <div class="text-2xl font-semibold">${{ number_format($kpi_monto_total, 2) }}</div>
            </x-filament::section>
        </div>

        <x-filament::section>
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="border-b">
                        <tr class="text-left">
                            <th class="py-3 pr-4">Tipo</th>
                            <th class="py-3 pr-4">Código</th>
                            <th class="py-3 pr-4">Fecha</th>
                            <th class="py-3 pr-4">Solicitante</th>
                            <th class="py-3 pr-4">Vehículo</th>
                            <th class="py-3 pr-4">Motorista</th>
                            <th class="py-3 pr-4">Detalle</th>
                            <th class="py-3 pr-4">Estado</th>
                            <th class="py-3 pr-4">Prioridad</th>
                            <th class="py-3 pr-4 text-right">Monto</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse ($this->paginatedRows as $row)
                            <tr class="border-b align-top">
                                <td class="py-3 pr-4">{{ $row['tipo_servicio'] }}</td>
                                <td class="py-3 pr-4 font-mono">{{ $row['codigo'] }}</td>
                                <td class="py-3 pr-4">
                                    {{ $row['fecha'] ? \Carbon\Carbon::parse($row['fecha'])->format('d/m/Y H:i') : '—' }}
                                </td>
                                <td class="py-3 pr-4">{{ $row['solicitante'] }}</td>
                                <td class="py-3 pr-4">{{ $row['vehiculo'] }}</td>
                                <td class="py-3 pr-4">{{ $row['motorista'] }}</td>
                                <td class="py-3 pr-4">{{ $row['detalle'] }}</td>
                                <td class="py-3 pr-4">
                                    <span class="fi-badge fi-color-gray">
                                        {{ ucfirst(str_replace('_', ' ', $row['estado'])) }}
                                    </span>
                                </td>
                                <td class="py-3 pr-4">{{ strtoupper($row['prioridad']) }}</td>
                                <td class="py-3 pr-4 text-right">
                                    ${{ number_format((float) $row['monto'], 2) }}
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="10" class="py-6 text-center text-gray-500">
                                    No hay registros para mostrar.
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