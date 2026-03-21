<x-filament::widget>
    @php($d = $this->getData())

    <div class="grid grid-cols-3 gap-4">
        <div class="p-4 bg-white rounded-xl shadow">
            <div class="text-xs text-gray-500">Combustible</div>
            <div class="text-xl font-bold">${{ number_format($d['combustible'], 2) }}</div>
        </div>

        <div class="p-4 bg-white rounded-xl shadow">
            <div class="text-xs text-gray-500">Mantenimiento</div>
            <div class="text-xl font-bold">${{ number_format($d['mantenimiento'], 2) }}</div>
        </div>

        <div class="p-4 bg-white rounded-xl shadow border-2 border-indigo-500">
            <div class="text-xs text-gray-500">Total sistema</div>
            <div class="text-xl font-bold">${{ number_format($d['total'], 2) }}</div>
        </div>
    </div>
</x-filament::widget>