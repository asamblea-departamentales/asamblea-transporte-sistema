<x-filament-panels::page>
    <div class="space-y-6">

        {{ $this->form }}

        <div class="grid grid-cols-1 gap-4 md:grid-cols-6">
            <x-filament::section>
                <div class="text-sm text-gray-500">Total solicitudes</div>
                <div class="text-2xl font-semibold">{{ $kpi_total }}</div>
            </x-filament::section>

            <x-filament::section>
                <div class="text-sm text-gray-500">Galones</div>
                <div class="text-2xl font-semibold">{{ number_format($kpi_galones, 2) }}</div>
            </x-filament::section>

            <x-filament::section>
                <div class="text-sm text-gray-500">Valor total</div>
                <div class="text-2xl font-semibold">${{ number_format($kpi_valor_total, 2) }}</div>
            </x-filament::section>

            <x-filament::section>
                <div class="text-sm text-gray-500">Monto asignado</div>
                <div class="text-2xl font-semibold">${{ number_format($kpi_monto_asignado, 2) }}</div>
            </x-filament::section>

            <x-filament::section>
                <div class="text-sm text-gray-500">Asignadas</div>
                <div class="text-2xl font-semibold">{{ $kpi_asignadas }}</div>
            </x-filament::section>

            <x-filament::section>
                <div class="text-sm text-gray-500">Completadas</div>
                <div class="text-2xl font-semibold">{{ $kpi_completadas }}</div>
            </x-filament::section>
        </div>

        <x-filament::section>
            {{ $this->table }}
        </x-filament::section>

    </div>
</x-filament-panels::page>