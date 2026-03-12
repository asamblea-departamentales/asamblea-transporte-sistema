<x-filament-panels::page>
    <div class="space-y-6">

        {{ $this->form }}

        <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
            <x-filament::section>
                <div class="text-sm text-gray-500">Total</div>
                <div class="text-2xl font-semibold">{{ $kpi_total }}</div>
            </x-filament::section>

            <x-filament::section>
                <div class="text-sm text-gray-500">Aprobadas</div>
                <div class="text-2xl font-semibold">{{ $kpi_aprobadas }}</div>
            </x-filament::section>

            <x-filament::section>
                <div class="text-sm text-gray-500">En ejecución</div>
                <div class="text-2xl font-semibold">{{ $kpi_en_ejecucion }}</div>
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