<x-filament-panels::page>
    {{ $this->form }}

    <div class="grid grid-cols-1 gap-4 mt-4 md:grid-cols-4">
        <x-filament::section>
            <div class="text-sm text-gray-500">Total</div>
            <div class="text-2xl font-bold">{{ $kpi_total }}</div>
        </x-filament::section>

        <x-filament::section>
            <div class="text-sm text-gray-500">Pendientes</div>
            <div class="text-2xl font-bold">{{ $kpi_pendientes }}</div>
        </x-filament::section>

        <x-filament::section>
            <div class="text-sm text-gray-500">Aprobadas</div>
            <div class="text-2xl font-bold">{{ $kpi_aprobadas }}</div>
        </x-filament::section>

        <x-filament::section>
            <div class="text-sm text-gray-500">Rechazadas</div>
            <div class="text-2xl font-bold">{{ $kpi_rechazadas }}</div>
        </x-filament::section>
    </div>

    <div class="mt-6">
        {{ $this->table }}
    </div>
</x-filament-panels::page>
