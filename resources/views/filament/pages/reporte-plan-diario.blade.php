<x-filament-panels::page>

    {{-- HEADER — logo + título + fecha selector --}}
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div class="flex items-center gap-3">
            <img src="{{ asset('images/logo-azul-fondo-transparente.png') }}"
                 alt="ALE"
                 class="h-10 w-auto object-contain shrink-0" />
            <div>
                <h1 class="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Plan Diario de Transporte
                </h1>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {{ \Carbon\Carbon::parse($fecha_seleccionada)->locale('es')->isoFormat('dddd, D [de] MMMM [de] YYYY') }}
                </p>
            </div>
        </div>
        <div class="flex items-center gap-3">
            <label for="fecha_seleccionada" class="text-xs text-gray-400 dark:text-gray-500 font-medium whitespace-nowrap">
                Seleccionar fecha
            </label>
            <input id="fecha_seleccionada"
                   type="date"
                   wire:model.live="fecha_seleccionada"
                   class="block w-full rounded-lg border-gray-400 shadow-sm text-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 ring-1 ring-inset ring-gray-300 focus:ring-primary-500" />
        </div>
    </div>

    {{-- KPIs con íconos --}}
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mx-auto mb-1 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
            <p class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Total Misiones</p>
            <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ $kpis['total'] ?? 0 }}</p>
        </div>
        <div class="rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/20 p-4 shadow-sm text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mx-auto mb-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <p class="text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">Programadas</p>
            <p class="text-3xl font-bold text-blue-600 dark:text-blue-400">{{ $kpis['programadas'] ?? 0 }}</p>
        </div>
        <div class="rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-900/20 p-4 shadow-sm text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mx-auto mb-1 text-amber-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
            <p class="text-xs text-amber-600 dark:text-amber-400 uppercase tracking-wide mb-1">Asignadas</p>
            <p class="text-3xl font-bold text-amber-600 dark:text-amber-400">{{ $kpis['asignadas'] ?? 0 }}</p>
        </div>
        <div class="rounded-xl border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/20 p-4 shadow-sm text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mx-auto mb-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <p class="text-xs text-green-600 dark:text-green-400 uppercase tracking-wide mb-1">Completadas</p>
            <p class="text-3xl font-bold text-green-600 dark:text-green-400">{{ $kpis['completadas'] ?? 0 }}</p>
        </div>
    </div>

    {{-- TABLA PRINCIPAL --}}
    <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
        <div class="max-h-[65vh] overflow-auto">
            <table class="min-w-full text-sm divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-800/80 sticky top-0 z-10">
                    <tr>
                        <th class="px-4 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide w-28">
                            Hora de Salida
                        </th>
                        <th class="px-4 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            Unidad Solicitante
                        </th>
                        <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            Destino
                        </th>
                        <th class="px-4 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap">
                            Vehículo
                        </th>
                        <th class="px-4 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap">
                            Motorista
                        </th>
                        <th class="px-4 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap">
                            Usuario
                        </th>
                        <th class="px-4 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap">
                            Estado
                        </th>
                        <th class="px-4 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap">
                            Comunicado
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                    @forelse ($datos as $i => $row)
                        @php
                            $estado = $row['estado'] ?? '';
                            [$badge, $dotColor] = match($estado) {
                                'programada'  => ['bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', '#3b82f6'],
                                'asignada'    => ['bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', '#f59e0b'],
                                'en_curso'    => ['bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300', '#f97316'],
                                'completada'  => ['bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', '#22c55e'],
                                'cancelada'   => ['bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300', '#ef4444'],
                                default       => ['bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300', '#9ca3af'],
                            };
                        @endphp
                        <tr class="{{ $i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-800/50' }} hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                            <td class="px-4 py-3.5 text-center font-mono text-xs font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                                {{ $row['hora'] }}
                            </td>
                            <td class="px-4 py-3.5 text-center text-sm text-gray-700 dark:text-gray-300">
                                {{ $row['unidad'] }}
                            </td>
                            <td class="px-4 py-3.5 text-sm text-gray-700 dark:text-gray-300 leading-snug max-w-xs truncate" title="{{ $row['destino'] }}">
                                {{ $row['destino'] }}
                            </td>
                            <td class="px-4 py-3.5 text-center text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap font-mono">
                                {{ $row['vehiculo'] }}
                            </td>
                            <td class="px-4 py-3.5 text-center text-sm text-gray-700 dark:text-gray-300">
                                {{ $row['motorista'] }}
                            </td>
                            <td class="px-4 py-3.5 text-center text-sm text-gray-700 dark:text-gray-300">
                                {{ $row['solicitante'] }}
                            </td>
                            <td class="px-4 py-3.5 text-center">
                                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold {{ $badge }}">
                                    <span class="h-1.5 w-1.5 rounded-full shrink-0" style="background-color: {{ $dotColor }};"></span>
                                    {{ ucfirst(str_replace('_', ' ', $estado)) }}
                                </span>
                            </td>
                            <td class="px-4 py-3.5 text-center text-xs text-gray-600 dark:text-gray-400">
                                {{ $row['comunicado'] ?? '' }}
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="8" class="text-center py-16 text-gray-400 dark:text-gray-500">
                                <div class="flex flex-col items-center gap-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                                    </svg>
                                    <span class="text-sm">No hay misiones programadas para esta fecha.</span>
                                </div>
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>

    {{-- FOOTER — total + botón PDF --}}
    <div class="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
            {{ count($datos) }} registro(s)
        </span>

        <a href="{{ route('reportes.plan-diario.pdf', ['fecha' => $fecha_seleccionada]) }}"
           target="_blank"
           class="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
            </svg>
            Generar PDF
        </a>
    </div>

</x-filament-panels::page>