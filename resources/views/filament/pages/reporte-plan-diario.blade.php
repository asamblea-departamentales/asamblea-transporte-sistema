<div class="min-h-screen bg-gray-100 p-4">

    {{-- ENCABEZADO INSTITUCIONAL --}}
    <div class="bg-white rounded-xl shadow mb-4 px-6 py-4">
        <div class="flex flex-col items-center text-center border-b border-gray-300 pb-4 mb-3">
            {{-- Logo Asamblea --}}
            <img src="{{ asset('images/logo-asamblea.png') }}"
                 alt="Asamblea Legislativa de El Salvador"
                 class="h-20 object-contain mb-2" />
            <div class="text-xs text-gray-500 uppercase tracking-wide font-medium">
                Asamblea Legislativa de El Salvador
            </div>
            <div class="text-sm font-semibold text-gray-700 uppercase mt-1">
                Departamento de Transporte
            </div>
        </div>

        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
                <h1 class="text-lg font-bold text-gray-800 uppercase tracking-wide">
                    Plan Diario de Transporte
                </h1>
                <p class="text-sm text-gray-500">
                    Fecha:
                    <span class="font-semibold text-gray-700">
                        {{ \Carbon\Carbon::parse($fecha_seleccionada)->locale('es')->isoFormat('dddd, D [de] MMMM [de] YYYY') }}
                    </span>
                </p>
            </div>

            <div class="flex items-center gap-3">
                <label class="text-sm text-gray-600 font-medium">Seleccionar fecha:</label>
                <input type="date"
                       wire:model.live="fecha_seleccionada"
                       class="text-sm rounded border border-gray-300 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
        </div>
    </div>

    {{-- KPIs --}}
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <div class="text-xs text-gray-500 uppercase font-medium mb-1">Total Misiones</div>
            <div class="text-2xl font-bold text-gray-800">{{ $kpis['total'] ?? 0 }}</div>
        </div>
        <div class="bg-white rounded-lg shadow-sm border-l-4 border-blue-500 border border-gray-200 p-4 text-center">
            <div class="text-xs text-gray-500 uppercase font-medium mb-1">Programadas</div>
            <div class="text-2xl font-bold text-blue-600">{{ $kpis['programadas'] ?? 0 }}</div>
        </div>
        <div class="bg-white rounded-lg shadow-sm border-l-4 border-yellow-500 border border-gray-200 p-4 text-center">
            <div class="text-xs text-gray-500 uppercase font-medium mb-1">Asignadas</div>
            <div class="text-2xl font-bold text-yellow-600">{{ $kpis['asignadas'] ?? 0 }}</div>
        </div>
        <div class="bg-white rounded-lg shadow-sm border-l-4 border-green-500 border border-gray-200 p-4 text-center">
            <div class="text-xs text-gray-500 uppercase font-medium mb-1">Completadas</div>
            <div class="text-2xl font-bold text-green-600">{{ $kpis['completadas'] ?? 0 }}</div>
        </div>
    </div>

    {{-- TABLA PRINCIPAL --}}
    <div class="bg-white rounded-xl shadow overflow-hidden">
        <div class="overflow-x-auto">
            <table class="min-w-full text-sm" style="border-collapse: collapse;">
                <thead>
                    <tr class="bg-gray-100 border-b-2 border-gray-300">
                        <th class="border border-gray-300 px-3 py-2 text-center text-xs font-bold text-gray-700 uppercase whitespace-nowrap w-24">
                            Hora de Salida
                        </th>
                        <th class="border border-gray-300 px-3 py-2 text-center text-xs font-bold text-gray-700 uppercase">
                            Unidad Solicitante
                        </th>
                        <th class="border border-gray-300 px-3 py-2 text-center text-xs font-bold text-gray-700 uppercase">
                            Destino
                        </th>
                        <th class="border border-gray-300 px-3 py-2 text-center text-xs font-bold text-gray-700 uppercase whitespace-nowrap">
                            Vehículo
                        </th>
                        <th class="border border-gray-300 px-3 py-2 text-center text-xs font-bold text-gray-700 uppercase whitespace-nowrap">
                            Motorista
                        </th>
                        <th class="border border-gray-300 px-3 py-2 text-center text-xs font-bold text-gray-700 uppercase whitespace-nowrap">
                            Usuario
                        </th>
                        <th class="border border-gray-300 px-3 py-2 text-center text-xs font-bold text-gray-700 uppercase whitespace-nowrap">
                            Estado
                        </th>
                        <th class="border border-gray-300 px-3 py-2 text-center text-xs font-bold text-gray-700 uppercase whitespace-nowrap">
                            Comunicado
                        </th>
                    </tr>
                </thead>
                <tbody>
                    @forelse ($datos as $row)
                        <tr class="hover:bg-blue-50 transition-colors">
                            <td class="border border-gray-300 px-3 py-3 text-center font-medium text-gray-800 whitespace-nowrap">
                                {{ $row['hora'] }}
                            </td>
                            <td class="border border-gray-300 px-3 py-3 text-center text-gray-700">
                                {{ $row['unidad'] }}
                            </td>
                            <td class="border border-gray-300 px-3 py-3 text-gray-700 text-xs leading-snug">
                                {{ $row['destino'] }}
                            </td>
                            <td class="border border-gray-300 px-3 py-3 text-center text-gray-700 whitespace-nowrap font-mono text-xs">
                                {{ $row['vehiculo'] }}
                            </td>
                            <td class="border border-gray-300 px-3 py-3 text-center text-gray-700">
                                {{ $row['motorista'] }}
                            </td>
                            <td class="border border-gray-300 px-3 py-3 text-center text-gray-700">
                                {{ $row['solicitante'] }}
                            </td>
                            <td class="border border-gray-300 px-3 py-3 text-center">
                                @php
                                    $estado = $row['estado'] ?? '';
                                    $badge = match($estado) {
                                        'programada'  => 'bg-blue-100 text-blue-700',
                                        'asignada'    => 'bg-yellow-100 text-yellow-700',
                                        'en_curso'    => 'bg-orange-100 text-orange-700',
                                        'completada'  => 'bg-green-100 text-green-700',
                                        'cancelada'   => 'bg-red-100 text-red-700',
                                        default       => 'bg-gray-100 text-gray-600',
                                    };
                                @endphp
                                <span class="inline-block px-2 py-0.5 rounded text-xs font-semibold {{ $badge }}">
                                    {{ ucfirst(str_replace('_', ' ', $estado)) }}
                                </span>
                            </td>
                            <td class="border border-gray-300 px-3 py-3 text-center text-gray-600 text-xs">
                                {{ $row['comunicado'] ?? '' }}
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="8" class="border border-gray-300 text-center py-10 text-gray-400 italic">
                                No hay misiones programadas para esta fecha.
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>

    {{-- PIE DE PÁGINA --}}
    <div class="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div class="text-xs text-gray-400">
            Total de registros: <strong class="text-gray-600">{{ count($datos) }}</strong>
        </div>

        <a href="{{ route('reportes.plan-diario.pdf', ['fecha' => $fecha_seleccionada]) }}"
           target="_blank"
           class="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded shadow transition-colors">
            🖨️ Generar PDF
        </a>
    </div>

</div>