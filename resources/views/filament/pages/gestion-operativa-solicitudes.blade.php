<x-filament::page>

<style>

/* ─────────────────────────────────────────
   Badges
───────────────────────────────────────── */

.badge-user {
    background:#eef2ff;
    color:#3730a3;
    font-weight:600;
}

.badge-age {
    background:#f3f4f6;
    color:#6b7280;
    font-weight:600;
}

/* ─────────────────────────────────────────
   Botones
───────────────────────────────────────── */

.btn-accion {
    padding:6px 12px;
    border-radius:10px;
    font-weight:600;
    font-size:13px;
}

.btn-indigo {
    background:#6366f1;
    color:white;
}

.btn-gray {
    background:#e5e7eb;
}

.btn-warning {
    background:#fbbf24;
    color:white;
}

</style>


<div class="space-y-6">

{{-- =========================================================
   VISTA DE ASIGNACIÓN
========================================================= --}}

<div class="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
    <div class="flex flex-wrap gap-2">

        <button wire:click="$set('vistaAsignacion','mis')" class="btn-accion btn-indigo">
            Mis solicitudes
        </button>

        <button wire:click="$set('vistaAsignacion','todas')" class="btn-accion btn-gray">
            Todas
        </button>

        <button wire:click="$set('vistaAsignacion','sin_asignar')" class="btn-accion btn-warning">
            Sin asignar
        </button>

    </div>
</div>


{{-- =========================================================
   GRID DE SOLICITUDES
========================================================= --}}

<div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

@foreach($rows as $row)

<div class="rounded-2xl border border-gray-200 bg-white shadow-sm p-5 space-y-4">


{{-- =========================================================
   HEADER
========================================================= --}}

<div class="space-y-2">

    <div class="flex items-center gap-2 flex-wrap">

        <span class="text-lg">
            @if($row['tipo'] === 'transporte') 🚗 @endif
            @if($row['tipo'] === 'combustible') ⛽ @endif
            @if($row['tipo'] === 'mantenimiento') 🔧 @endif
        </span>

        <span class="font-semibold text-gray-900">
            {{ ucfirst($row['tipo']) }}
        </span>

        <span class="text-sm text-gray-500">
            {{ $row['codigo'] }}
        </span>

        <span class="text-xs text-gray-400">•</span>

        <span class="text-xs text-gray-500">
            #{{ $row['id'] }}
        </span>

        <span class="text-xs text-gray-400">•</span>

        <span class="text-xs text-gray-500">
            {{ $row['fecha_ingreso'] }}
        </span>

    </div>


    {{-- Usuario asignado --}}
    @if(!empty($row['asignado']))
        <span class="badge badge-user px-2 py-1 rounded">
            👤 {{ $row['asignado'] }}
        </span>
    @endif


    {{-- Edad solicitud --}}
    @if(!empty($row['fecha_ingreso']))
        <span class="badge badge-age px-2 py-1 rounded">
            ⏱ {{ \Carbon\Carbon::parse($row['fecha_ingreso'])->diffForHumans() }}
        </span>
    @endif

</div>


{{-- =========================================================
   BADGES DE ESTADO
========================================================= --}}

<div class="flex gap-2 flex-wrap">

<span class="badge px-2 py-1 rounded bg-red-100 text-red-700">
    {{ strtoupper($row['prioridad'] ?? 'MEDIA') }}
</span>

<span class="badge px-2 py-1 rounded bg-yellow-100 text-yellow-800">
    {{ strtoupper($row['estado']) }}
</span>

</div>


{{-- =========================================================
   META INFO
========================================================= --}}

<div class="grid grid-cols-2 gap-3 text-sm">

<div>
    <div class="text-gray-400">Solicitante</div>
    <div class="font-medium">{{ $row['solicitante'] }}</div>
</div>

<div>
    <div class="text-gray-400">Unidad</div>
    <div class="font-medium">{{ $row['unidad'] }}</div>
</div>

<div>
    <div class="text-gray-400">ID</div>
    <div class="font-medium">{{ $row['id'] }}</div>
</div>

<div>
    <div class="text-gray-400">Etapa</div>
    <div class="font-medium">{{ $row['etapa'] }}</div>
</div>

<div>
    <div class="text-gray-400">Asignado a</div>
    <div class="font-medium">
        {{ $row['asignado'] ?? 'Sin asignar' }}
    </div>
</div>

</div>


{{-- =========================================================
   DETALLE
========================================================= --}}

@if(!empty($row['detalle']))
<div class="text-sm text-gray-600">
    {{ $row['detalle'] }}
</div>
@endif


{{-- =========================================================
   ACCIONES
========================================================= --}}

<div class="flex gap-2 flex-wrap pt-2">

<button class="btn-accion btn-indigo">
    Validar
</button>

<button class="btn-accion btn-warning">
    Observar
</button>

<button class="btn-accion btn-gray">
    Derivar
</button>

</div>


</div>

@endforeach

</div>

</div>

</x-filament::page>
