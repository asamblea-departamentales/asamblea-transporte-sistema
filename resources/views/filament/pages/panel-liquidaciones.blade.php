<x-filament::page>

    <div class="space-y-4">

        @foreach($this->data as $item)
            <div class="p-4 border rounded-xl bg-white shadow-sm flex justify-between items-center">

                <div>
                    <div class="font-bold">
                        {{ $item['codigo'] }}
                    </div>

                    <div class="text-sm text-gray-500">
                        {{ ucfirst($item['tipo']) }} · {{ $item['vehiculo'] }} · {{ $item['solicitante'] }}
                    </div>

                    <div class="text-xs text-gray-400">
                        {{ $item['fecha'] }}
                    </div>
                </div>

                <div class="text-right space-y-1">
                    <div class="font-bold">
                        ${{ number_format($item['monto'], 2) }}
                    </div>

                    <div>
                        @if($item['tiene_comprobantes'])
                            <span class="text-green-600">✔ Comprobantes</span>
                        @else
                            <span class="text-red-500">✖ Sin comprobantes</span>
                        @endif
                    </div>

                    <div>
                        @if($item['liquidado'])
                            <span class="text-blue-600">Liquidado</span>
                        @else
                            <span class="text-yellow-600">Pendiente</span>
                        @endif
                    </div>
                </div>

                <div class="flex gap-2">

                    {{-- Acción dinámica --}}
                    @if(!$item['liquidado'] && $item['tiene_comprobantes'])

                        @if($item['tipo'] === 'combustible')
                            <a href="/admin/solicitudes-combustible/{{ $item['id'] }}"
                               class="px-3 py-1 bg-green-600 text-white rounded">
                                Liquidar
                            </a>
                        @endif

                        @if($item['tipo'] === 'mantenimiento')
                            <a href="/admin/solicitudes-mantenimiento/{{ $item['id'] }}"
                               class="px-3 py-1 bg-blue-600 text-white rounded">
                                Liquidar
                            </a>
                        @endif

                    @endif

                    {{-- PDF --}}
                    @if($item['tipo'] === 'combustible')
                        <a href="{{ route('liquidacion.combustible.pdf', $item['id']) }}"
                           target="_blank"
                           class="px-3 py-1 bg-gray-100 text-gray-700 rounded">
                            PDF
                        </a>
                    @endif

                    @if($item['tipo'] === 'mantenimiento')
                        <a href="{{ route('liquidacion.mantenimiento.pdf', $item['id']) }}"
                           target="_blank"
                           class="px-3 py-1 bg-gray-100 text-gray-700 rounded">
                            PDF
                        </a>
                    @endif

                </div>
            </div>
        @endforeach

    </div>

</x-filament::page>