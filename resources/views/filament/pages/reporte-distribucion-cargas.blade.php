<x-filament-panels::page>

<div class="space-y-6">

{{ $this->form }}

<div class="grid grid-cols-4 gap-4">

<x-filament::section>
<div class="text-sm text-gray-500">Solicitudes</div>
<div class="text-2xl font-bold">{{ $kpi_total }}</div>
</x-filament::section>

<x-filament::section>
<div class="text-sm text-gray-500">Cargas</div>
<div class="text-2xl font-bold">{{ $kpi_cargas }}</div>
</x-filament::section>

<x-filament::section>
<div class="text-sm text-gray-500">Monto</div>
<div class="text-2xl font-bold">${{ number_format($kpi_monto,2) }}</div>
</x-filament::section>

<x-filament::section>
<div class="text-sm text-gray-500">Galones</div>
<div class="text-2xl font-bold">{{ number_format($kpi_galones,2) }}</div>
</x-filament::section>

</div>

<x-filament::section>
{{ $this->table }}
</x-filament::section>

</div>

</x-filament-panels::page>
