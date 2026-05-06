<div>
    <div class="flex items-center justify-between mb-4">
        <h1 class="text-2xl font-bold">📅 Plan Diario de Transporte</h1>
        <input type="date" wire:model="fecha_seleccionada" class="rounded border-gray-300" />
    </div>

    {{-- KPIs --}}
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-xl shadow p-4">
            <div class="text-sm text-gray-500">Total Misiones</div>
            <div class="text-2xl font-bold">{{ $kpis['total'] ?? 0 }}</div>
        </div>
        <div class="bg-white rounded-xl shadow p-4">
            <div class="text-sm text-gray-500">Programadas</div>
            <div class="text-2xl font-bold text-blue-600">{{ $kpis['programadas'] ?? 0 }}</div>
        </div>
        <div class="bg-white rounded-xl shadow p-4">
            <div class="text-sm text-gray-500">Asignadas</div>
            <div class="text-2xl font-bold text-yellow-600">{{ $kpis['asignadas'] ?? 0 }}</div>
        </div>
        <div class="bg-white rounded-xl shadow p-4">
            <div class="text-sm text-gray-500">Completadas</div>
            <div class="text-2xl font-bold text-green-600">{{ $kpis['completadas'] ?? 0 }}</div>
        </div>
    </div>

    {{-- Tabla --}}
    <div class="bg-white rounded-xl shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hora</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unidad</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destino</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehículo</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Motorista</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Solicitante</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comunicado</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                @forelse ($datos as $row)
                    <tr class="hover:bg-gray-50">
                        <td class="px-6 py-4">{{ $row['hora'] }}</td>
                        <td class="px-6 py-4">{{ $row['unidad'] }}</td>
                        <td class="px-6 py-4">{{ $row['destino'] }}</td>
                        <td class="px-6 py-4">{{ $row['vehiculo'] }}</td>
                        <td class="px-6 py-4">{{ $row['motorista'] }}</td>
                        <td class="px-6 py-4">{{ $row['solicitante'] }}</td>
                        <td class="px-6 py-4">
                            {{ ucfirst(str_replace('_', ' ', $row['estado'])) }}
                        </td>
                        <td class="px-6 py-4">{{ $row['comunicado'] }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="8" class="text-center py-4">
                            No hay misiones programadas para esta fecha.
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    {{-- Botón PDF --}}
    <div class="mt-6">
        <a href="{{ route('reportes.plan-diario.pdf', ['fecha' => $fecha_seleccionada]) }}" 
           class="px-4 py-2 bg-blue-600 text-white rounded">
            🖨️ Generar PDF
        </a>
    </div>
</div>