<x-filament::page>

    {{-- FILTROS --}}
    <div class="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            <div>
                <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Desde
                </label>
                <input
                    type="date"
                    wire:model.live="fecha_desde"
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
            </div>

            <div>
                <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Hasta
                </label>
                <input
                    type="date"
                    wire:model.live="fecha_hasta"
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
            </div>

            <div>
                <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Tipo
                </label>
                <select
                    wire:model.live="tipo"
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                    <option value="">Todos</option>
                    <option value="combustible">Combustible</option>
                    <option value="mantenimiento">Mantenimiento</option>
                </select>
            </div>

            <div>
                <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Estado
                </label>
                <select
                    wire:model.live="estado"
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                    <option value="">Todos</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="liquidado">Liquidado</option>
                </select>
            </div>

        </div>

        <div class="flex items-center justify-between mt-4">
            <p class="text-xs text-gray-400">
                {{ $this->getData()->count() }} resultado(s) encontrados
            </p>
            <button
                wire:click="limpiarFiltros"
                class="text-xs text-gray-500 hover:text-gray-700 underline"
            >
                Limpiar filtros
            </button>
        </div>
    </div>

    {{-- LISTADO --}}
    @forelse($this->getData() as $item)
        <div class="bg-white border border-gray-200 rounded-xl shadow-sm mb-3 overflow-hidden">
            <div class="flex items-center justify-between px-5 py-4 gap-4">

                {{-- INFO PRINCIPAL --}}
                <div class="flex items-center gap-4 min-w-0">

                    {{-- Badge tipo --}}
                    <div class="shrink-0">
                        @if($item['tipo'] === 'combustible')
                            <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-100 text-amber-800">
                                Combustible
                            </span>
                        @else
                            <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-800">
                                Mantenimiento
                            </span>
                        @endif
                    </div>

                    <div class="min-w-0">
                        <div class="font-bold text-gray-900 font-mono text-sm">
                            {{ $item['codigo'] }}
                        </div>
                        <div class="text-sm text-gray-500 truncate">
                            {{ $item['vehiculo'] ?? '—' }} · {{ $item['solicitante'] ?? '—' }}
                        </div>
                        <div class="text-xs text-gray-400 mt-0.5">
                            {{ $item['fecha'] ? \Carbon\Carbon::parse($item['fecha'])->format('d/m/Y') : '—' }}
                        </div>
                    </div>
                </div>

                {{-- MONTO + ESTADO --}}
                <div class="text-right shrink-0 space-y-1">
                    <div class="text-base font-bold text-gray-900">
                        ${{ number_format($item['monto'], 2) }}
                    </div>

                    <div>
                        @if($item['tiene_comprobantes'])
                            <span class="text-xs text-green-600 font-medium">✔ Comprobantes</span>
                        @else
                            <span class="text-xs text-red-500 font-medium">✖ Sin comprobantes</span>
                        @endif
                    </div>

                    <div>
                        @if($item['liquidado'])
                            <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                Liquidado
                            </span>
                        @else
                            <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                                Pendiente
                            </span>
                        @endif
                    </div>
                </div>

                {{-- ACCIONES --}}
                <div class="flex items-center gap-2 shrink-0">

                    @if(!$item['liquidado'] && $item['tiene_comprobantes'])
                        @if($item['tipo'] === 'combustible')
                            <a href="/admin/solicitudes-combustible/{{ $item['id'] }}"
                               class="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-600 hover:bg-green-700 text-white transition">
                                Liquidar
                            </a>
                        @else
                            <a href="/admin/solicitudes-mantenimiento/{{ $item['id'] }}"
                               class="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition">
                                Liquidar
                            </a>
                        @endif
                    @endif

                    @if($item['tipo'] === 'combustible')
                        <a href="{{ route('liquidacion.combustible.pdf', $item['id']) }}"
                           target="_blank"
                           class="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition">
                            PDF
                        </a>
                    @else
                        <a href="{{ route('liquidacion.mantenimiento.pdf', $item['id']) }}"
                           target="_blank"
                           class="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition">
                            PDF
                        </a>
                    @endif

                </div>
            </div>
        </div>
    @empty
        <div class="text-center py-16 text-gray-400">
            <div class="text-4xl mb-3">📋</div>
            <p class="font-medium">Sin resultados para los filtros seleccionados</p>
            <p class="text-sm mt-1">Ajusta el rango de fechas o el tipo de solicitud</p>
        </div>
    @endforelse

</x-filament::page>