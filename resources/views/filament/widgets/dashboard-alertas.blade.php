<x-filament::widget>
    @php($d = $this->getData())

    <div class="grid grid-cols-2 gap-4">
        <div class="p-4 bg-red-50 border border-red-200 rounded-xl">
            <div class="text-xs text-red-600">Incidencias abiertas</div>
            <div class="text-xl font-bold text-red-700">{{ $d['incidencias'] }}</div>
        </div>

        <div class="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <div class="text-xs text-yellow-600">Sin comprobantes</div>
            <div class="text-xl font-bold text-yellow-700">{{ $d['sinComprobantes'] }}</div>
        </div>
    </div>
</x-filament::widget>