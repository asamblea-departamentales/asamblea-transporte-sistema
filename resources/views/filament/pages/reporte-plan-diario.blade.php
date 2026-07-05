<div class="min-h-screen bg-[#F7F8FA] p-4">

    {{-- ENCABEZADO INSTITUCIONAL --}}
    <div class="bg-white rounded-xl shadow-sm border border-[#DDE3EA] mb-4 px-6 py-5">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 mb-4 border-b border-[#DDE3EA]">
            <div class="flex items-center gap-4">
                <img src="{{ asset('images/logo-azul-fondo-transparente.png') }}"
                     alt="Asamblea Legislativa de El Salvador"
                     class="h-14 object-contain shrink-0" />
                <div>
                    <div class="text-[11px] text-[#6B7A8D] uppercase tracking-[0.12em] font-semibold">
                        Asamblea Legislativa de El Salvador
                    </div>
                    <div class="text-xs text-[#8A97A8] uppercase tracking-wide">
                        Departamento de Transporte
                    </div>
                </div>
            </div>

            <div class="text-left lg:text-right">
                <h1 class="text-lg font-bold text-[#1C2B39] uppercase tracking-wide">
                    Plan Diario de Transporte
                </h1>
                <p class="text-sm text-[#6B7A8D]">
                    <span class="font-semibold text-[#1C2B39]">
                        {{ \Carbon\Carbon::parse($fecha_seleccionada)->locale('es')->isoFormat('dddd, D [de] MMMM [de] YYYY') }}
                    </span>
                </p>
            </div>
        </div>

        <div class="flex items-center justify-end gap-3">
            <label for="fecha_seleccionada" class="text-sm text-[#4B5B6D] font-medium">
                Seleccionar fecha
            </label>
            <input id="fecha_seleccionada"
                   type="date"
                   wire:model.live="fecha_seleccionada"
                   class="text-sm rounded-lg border border-[#DDE3EA] px-3 py-1.5 text-[#1C2B39] focus:outline-none focus:ring-2 focus:ring-[#2C5D8F]/40 focus:border-[#2C5D8F]" />
        </div>
    </div>

    {{-- KPIs --}}
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        @php
            $kpiCards = [
                ['label' => 'Total Misiones', 'value' => $kpis['total'] ?? 0, 'color' => '#4B5B6D'],
                ['label' => 'Programadas', 'value' => $kpis['programadas'] ?? 0, 'color' => '#2C5D8F'],
                ['label' => 'Asignadas', 'value' => $kpis['asignadas'] ?? 0, 'color' => '#92660B'],
                ['label' => 'Completadas', 'value' => $kpis['completadas'] ?? 0, 'color' => '#1F6B3B'],
            ];
        @endphp
        @foreach ($kpiCards as $kpi)
            <div class="bg-white rounded-lg shadow-sm border border-[#DDE3EA] p-4">
                <div class="flex items-center gap-2 mb-2">
                    <span class="h-2 w-2 rounded-full" style="background-color: {{ $kpi['color'] }};"></span>
                    <span class="text-[11px] text-[#6B7A8D] uppercase tracking-wide font-semibold">
                        {{ $kpi['label'] }}
                    </span>
                </div>
                <div class="text-2xl font-bold tabular-nums" style="color: {{ $kpi['color'] }};">
                    {{ $kpi['value'] }}
                </div>
            </div>
        @endforeach
    </div>

    {{-- TABLA PRINCIPAL --}}
    <div class="bg-white rounded-xl shadow-sm border border-[#DDE3EA] overflow-hidden">
        <div class="overflow-x-auto">
            <table class="min-w-full text-sm" style="border-collapse: collapse;">
                <thead>
                    <tr class="bg-[#F0F3F7] border-b border-[#DDE3EA] sticky top-0 z-10">
                        <th class="px-3 py-2.5 text-center text-[11px] font-bold text-[#4B5B6D] uppercase tracking-wide whitespace-nowrap w-24">
                            Hora de Salida
                        </th>
                        <th class="px-3 py-2.5 text-center text-[11px] font-bold text-[#4B5B6D] uppercase tracking-wide">
                            Unidad Solicitante
                        </th>
                        <th class="px-3 py-2.5 text-center text-[11px] font-bold text-[#4B5B6D] uppercase tracking-wide">
                            Destino
                        </th>
                        <th class="px-3 py-2.5 text-center text-[11px] font-bold text-[#4B5B6D] uppercase tracking-wide whitespace-nowrap">
                            Vehículo
                        </th>
                        <th class="px-3 py-2.5 text-center text-[11px] font-bold text-[#4B5B6D] uppercase tracking-wide whitespace-nowrap">
                            Motorista
                        </th>
                        <th class="px-3 py-2.5 text-center text-[11px] font-bold text-[#4B5B6D] uppercase tracking-wide whitespace-nowrap">
                            Usuario
                        </th>
                        <th class="px-3 py-2.5 text-center text-[11px] font-bold text-[#4B5B6D] uppercase tracking-wide whitespace-nowrap">
                            Estado
                        </th>
                        <th class="px-3 py-2.5 text-center text-[11px] font-bold text-[#4B5B6D] uppercase tracking-wide whitespace-nowrap">
                            Comunicado
                        </th>
                    </tr>
                </thead>
                <tbody>
                    @forelse ($datos as $i => $row)
                        @php
                            $estado = $row['estado'] ?? '';
                            [$badge, $bar] = match($estado) {
                                'programada'  => ['bg-[#E4EDF5] text-[#2C5D8F]', '#2C5D8F'],
                                'asignada'    => ['bg-[#FBF0DC] text-[#92660B]', '#92660B'],
                                'en_curso'    => ['bg-[#FBE7D9] text-[#9A4A15]', '#9A4A15'],
                                'completada'  => ['bg-[#E1F0E6] text-[#1F6B3B]', '#1F6B3B'],
                                'cancelada'   => ['bg-[#F7E1E1] text-[#9B2C2C]', '#9B2C2C'],
                                default       => ['bg-[#EDEEF0] text-[#4B5563]', '#C6CCD4'],
                            };
                        @endphp
                        <tr class="border-b border-[#DDE3EA] {{ $i % 2 === 1 ? 'bg-[#FAFBFC]' : 'bg-white' }} hover:bg-[#EEF3F8] transition-colors"
                            style="border-left: 3px solid {{ $bar }};">
                            <td class="px-3 py-3 text-center font-mono text-xs font-medium text-[#1C2B39] whitespace-nowrap">
                                {{ $row['hora'] }}
                            </td>
                            <td class="px-3 py-3 text-center text-[#3E4C5E]">
                                {{ $row['unidad'] }}
                            </td>
                            <td class="px-3 py-3 text-[#3E4C5E] text-xs leading-snug">
                                {{ $row['destino'] }}
                            </td>
                            <td class="px-3 py-3 text-center text-[#3E4C5E] whitespace-nowrap font-mono text-xs">
                                {{ $row['vehiculo'] }}
                            </td>
                            <td class="px-3 py-3 text-center text-[#3E4C5E]">
                                {{ $row['motorista'] }}
                            </td>
                            <td class="px-3 py-3 text-center text-[#3E4C5E]">
                                {{ $row['solicitante'] }}
                            </td>
                            <td class="px-3 py-3 text-center">
                                <span class="inline-block px-2.5 py-1 rounded-full text-xs font-semibold {{ $badge }}">
                                    {{ ucfirst(str_replace('_', ' ', $estado)) }}
                                </span>
                            </td>
                            <td class="px-3 py-3 text-center text-[#6B7A8D] text-xs">
                                {{ $row['comunicado'] ?? '' }}
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="8" class="text-center py-14 text-[#8A97A8]">
                                <div class="flex flex-col items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-[#C6CCD4]" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                                    </svg>
                                    <span class="italic">No hay misiones programadas para esta fecha.</span>
                                </div>
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>

    {{-- PIE DE PÁGINA --}}
    <div class="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div class="text-xs text-[#8A97A8]">
            Total de registros: <strong class="text-[#1C2B39]">{{ count($datos) }}</strong>
        </div>

        <a href="{{ route('reportes.plan-diario.pdf', ['fecha' => $fecha_seleccionada]) }}"
           target="_blank"
           class="inline-flex items-center gap-2 px-4 py-2 bg-[#2C5D8F] hover:bg-[#234A73] text-white text-sm font-medium rounded-lg shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C5D8F]/50">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
            </svg>
            Generar PDF
        </a>
    </div>

</div>