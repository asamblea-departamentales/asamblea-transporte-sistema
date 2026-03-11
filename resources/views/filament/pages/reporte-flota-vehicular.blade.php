<x-filament-panels::page>
    <div class="space-y-6">

        {{ $this->form }}

        <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
            <x-filament::section>
                <div class="text-sm text-gray-500">Total vehículos</div>
                <div class="text-2xl font-semibold">{{ $kpi_total }}</div>
            </x-filament::section>

            <x-filament::section>
                <div class="text-sm text-gray-500">Activos</div>
                <div class="text-2xl font-semibold">{{ $kpi_activos }}</div>
            </x-filament::section>

            <x-filament::section>
                <div class="text-sm text-gray-500">Con asignación</div>
                <div class="text-2xl font-semibold">{{ $kpi_con_asignacion }}</div>
            </x-filament::section>

            <x-filament::section>
                <div class="text-sm text-gray-500">Sin asignación</div>
                <div class="text-2xl font-semibold">{{ $kpi_sin_asignacion }}</div>
            </x-filament::section>
        </div>

        <x-filament::section>
            {{ $this->table }}
        </x-filament::section>

    </div>
</x-filament-panels::page>