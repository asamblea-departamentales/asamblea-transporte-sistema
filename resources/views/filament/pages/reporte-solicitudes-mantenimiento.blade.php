<x-filament-panels::page>

    {{-- KPIs --}}
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 mb-6">

        <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm text-center">
            <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Total</p>
            <p class="text-3xl font-bold text-primary-600">{{ $kpi_total }}</p>
        </div>

        <div class="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/20 p-4 shadow-sm text-center">
            <p class="text-xs text-amber-600 uppercase tracking-wide mb-1">Pendientes</p>
            <p class="text-3xl font-bold text-amber-600">{{ $kpi_pendientes }}</p>
        </div>

        <div class="rounded-xl border border-green-200 bg-green-50 dark:bg-green-900/20 p-4 shadow-sm text-center">
            <p class="text-xs text-green-600 uppercase tracking-wide mb-1">Aprobadas</p>
            <p class="text-3xl font-bold text-green-600">{{ $kpi_aprobadas }}</p>
        </div>

        <div class="rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 p-4 shadow-sm text-center">
            <p class="text-xs text-red-600 uppercase tracking-wide mb-1">Rechazadas</p>
            <p class="text-3xl font-bold text-red-600">{{ $kpi_rechazadas }}</p>
        </div>

        <div class="rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-900/20 p-4 shadow-sm text-center">
            <p class="text-xs text-blue-600 uppercase tracking-wide mb-1">Costo Est.</p>
            <p class="text-2xl font-bold text-blue-600">${{ $kpi_costo_estimado }}</p>
        </div>

        <div class="rounded-xl border border-gray-200 bg-gray-50 dark:bg-gray-900/20 p-4 shadow-sm text-center">
            <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Costo Real</p>
            <p class="text-2xl font-bold text-gray-700 dark:text-gray-200">${{ $kpi_costo_real }}</p>
        </div>

    </div>

    {{-- Filtros --}}
    <x-filament-panels::form wire:submit="null">
        {{ $this->form }}
    </x-filament-panels::form>

    {{-- Tabla --}}
    <div class="mt-4">
        {{ $this->table }}
    </div>

</x-filament-panels::page>