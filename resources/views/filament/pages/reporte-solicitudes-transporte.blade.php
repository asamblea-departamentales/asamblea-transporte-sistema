<x-filament-panels::page>
    <div class="space-y-6">

        {{-- Filtros --}}
        {{ $this->form }}

        {{-- KPIs --}}
        <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
            <x-filament::section>
                <div class="text-sm text-gray-500">Total</div>
                <div class="text-2xl font-semibold">{{ $kpi_total }}</div>
            </x-filament::section>

            <x-filament::section>
                <div class="text-sm text-gray-500">Pendientes</div>
                <div class="text-2xl font-semibold">{{ $kpi_pendientes }}</div>
            </x-filament::section>

            <x-filament::section>
                <div class="text-sm text-gray-500">Aprobadas</div>
                <div class="text-2xl font-semibold">{{ $kpi_aprobadas }}</div>
            </x-filament::section>

            <x-filament::section>
                <div class="text-sm text-gray-500">Rechazadas</div>
                <div class="text-2xl font-semibold">{{ $kpi_rechazadas }}</div>
            </x-filament::section>
        </div>

        {{-- Tabla --}}
        <x-filament::section>
            {{ $this->table }}
        </x-filament::section>

    </div>
</x-filament-panels::page>