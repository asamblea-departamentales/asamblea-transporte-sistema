<x-filament-panels::page>
    <div class="space-y-6">
        {{ $this->form }}

        <x-filament::section>
            <div class="text-center text-gray-500 py-6">
                <p class="text-base font-medium">Seleccioná un vehículo y un rango de fechas</p>
                <p class="text-sm mt-1">Luego hacé clic en "Exportar PDF" para generar el reporte.</p>
            </div>
        </x-filament::section>
    </div>
</x-filament-panels::page>
