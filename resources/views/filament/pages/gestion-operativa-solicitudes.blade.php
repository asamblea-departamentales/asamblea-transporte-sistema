<x-filament-panels::page>

{{-- ── ESTILOS GLOBALES DE LA PÁGINA ─────────────────────────────────────── --}}
<style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');

    .gos-wrap * { font-family: 'DM Sans', sans-serif; }
    .gos-wrap .mono { font-family: 'DM Mono', monospace; }

    .gos-step {
        position: relative;
        cursor: pointer;
        border: 1.5px solid #e5e7eb;
        border-radius: 16px;
        padding: 18px 20px;
        background: #fff;
        transition: border-color .2s, box-shadow .2s, background .2s;
        overflow: hidden;
    }
    .gos-step::before {
        content: '';
        position: absolute;
        top: 0; left: 0;
        width: 4px; height: 100%;
        background: transparent;
        border-radius: 16px 0 0 16px;
        transition: background .2s;
    }
    .gos-step:hover { background: #f9fafb; }
    .gos-step.locked { opacity: .45; cursor: not-allowed; pointer-events: none; }
    .gos-step.active-bandeja  { border-color: #6366f1; background: #eef2ff; box-shadow: 0 0 0 3px #e0e7ff; }
    .gos-step.active-bandeja::before  { background: #6366f1; }
    .gos-step.active-revision  { border-color: #f59e0b; background: #fffbeb; box-shadow: 0 0 0 3px #fef3c7; }
    .gos-step.active-revision::before  { background: #f59e0b; }
    .gos-step.active-aprobaciones  { border-color: #10b981; background: #ecfdf5; box-shadow: 0 0 0 3px #d1fae5; }
    .gos-step.active-aprobaciones::before  { background: #10b981; }

    .step-num {
        display: inline-flex; align-items: center; justify-content: center;
        width: 26px; height: 26px; border-radius: 50%;
        font-size: 11px; font-weight: 700; letter-spacing: .02em; margin-bottom: 8px;
    }
    .step-num-bandeja      { background:#6366f1; color:#fff; }
    .step-num-revision     { background:#f59e0b; color:#fff; }
    .step-num-aprobaciones { background:#10b981; color:#fff; }
    .step-num-inactive     { background:#e5e7eb; color:#9ca3af; }

    .kpi-card { border-radius: 16px; border: 1.5px solid #f3f4f6; background: #fff; padding: 18px 20px; transition: box-shadow .2s; }
    .kpi-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.06); }
    .kpi-value { font-size: 2rem; font-weight: 700; line-height: 1; letter-spacing: -.04em; }

    .sol-card { border-radius: 20px; border: 1.5px solid #e5e7eb; background: #fff; overflow: hidden; transition: border-color .2s, box-shadow .2s; }
    .sol-card:hover { border-color: #c7d2fe; box-shadow: 0 4px 20px rgba(99,102,241,.07); }
    .sol-card-header { padding: 14px 20px 10px; border-bottom: 1px solid #f3f4f6; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .sol-card-body { padding: 16px 20px; }
    .sol-card-actions { padding: 14px 20px; border-top: 1px solid #f3f4f6; background: #fafafa; display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }

    .badge { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 600; letter-spacing: .04em; padding: 3px 10px; border-radius: 999px; text-transform: uppercase; }
    .badge-tipo        { background: #f1f5f9; color: #475569; }
    .badge-pendiente   { background: #fef9c3; color: #854d0e; }
    .badge-revision    { background: #fef3c7; color: #92400e; }
    .badge-preaprobada { background: #d1fae5; color: #065f46; }
    .badge-aprobada    { background: #dcfce7; color: #166534; }
    .badge-rechazada   { background: #fee2e2; color: #991b1b; }
    .badge-condicionada{ background: #fde8d0; color: #9a3412; }
    .badge-default     { background: #f3f4f6; color: #6b7280; }
    .badge-alta   { background: #fee2e2; color: #b91c1c; }
    .badge-media  { background: #fef3c7; color: #b45309; }
    .badge-baja   { background: #d1fae5; color: #065f46; }

    .asignado-chip { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 999px; background: #f0f9ff; color: #0369a1; border: 1px solid #bae6fd; max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .asignado-chip.sin-asignar { background: #f9fafb; color: #9ca3af; border-color: #e5e7eb; }

    .edad-chip { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 500; color: #6b7280; white-space: nowrap; }
    .edad-chip.urgente { color: #dc2626; font-weight: 700; }
    .edad-chip.atencion { color: #d97706; font-weight: 600; }

    .meta-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 12px 20px; }
    @media (min-width: 640px)  { .meta-grid { grid-template-columns: repeat(3,1fr); } }
    @media (min-width: 1024px) { .meta-grid { grid-template-columns: repeat(4,1fr); } }
    .meta-label { font-size: 10px; text-transform: uppercase; letter-spacing: .07em; color: #9ca3af; font-weight: 600; margin-bottom: 4px; }
    .meta-value { font-size: 13px; font-weight: 500; color: #111827; }

    .btn-accion { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 600; padding: 6px 14px; border-radius: 10px; border: 1.5px solid transparent; cursor: pointer; transition: all .15s; white-space: nowrap; }
    .btn-success { background:#10b981; color:#fff; border-color:#10b981; }
    .btn-success:hover { background:#059669; border-color:#059669; }
    .btn-warning { background:#f59e0b; color:#fff; border-color:#f59e0b; }
    .btn-warning:hover { background:#d97706; border-color:#d97706; }
    .btn-danger  { background:#ef4444; color:#fff; border-color:#ef4444; }
    .btn-danger:hover  { background:#dc2626; border-color:#dc2626; }
    .btn-gray    { background:#f3f4f6; color:#374151; border-color:#e5e7eb; }
    .btn-gray:hover    { background:#e5e7eb; }
    .btn-indigo  { background:#6366f1; color:#fff; border-color:#6366f1; }
    .btn-indigo:hover  { background:#4f46e5; border-color:#4f46e5; }

    .prio-btn { flex: 1; text-align: center; font-size: 11px; font-weight: 700; padding: 5px 8px; border-radius: 8px; cursor: pointer; transition: all .15s; text-transform: uppercase; letter-spacing: .04em; }
    .prio-alta  { background:#fee2e2; color:#b91c1c; border: 1.5px solid #fca5a5; }
    .prio-alta:hover  { background:#fca5a5; }
    .prio-media { background:#fef3c7; color:#b45309; border: 1.5px solid #fcd34d; }
    .prio-media:hover { background:#fcd34d; }
    .prio-baja  { background:#d1fae5; color:#065f46; border: 1.5px solid #6ee7b7; }
    .prio-baja:hover  { background:#a7f3d0; }

    .modal-check-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .check-item { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 500; color: #374151; padding: 10px 12px; border-radius: 10px; background: #f9fafb; border: 1.5px solid #e5e7eb; cursor: pointer; transition: border-color .15s, background .15s; }
    .check-item:has(input:checked) { border-color: #6366f1; background: #eef2ff; color: #3730a3; }
    .check-item input { accent-color: #6366f1; width: 15px; height: 15px; cursor: pointer; }

    .modal-textarea { width: 100%; border-radius: 12px; border: 1.5px solid #e5e7eb; padding: 10px 14px; font-size: 13px; color: #111827; font-family: 'DM Sans', sans-serif; resize: vertical; outline: none; transition: border-color .15s; background: #fff; }
    .modal-textarea:focus { border-color: #6366f1; box-shadow: 0 0 0 3px #e0e7ff; }
    .modal-textarea::placeholder { color: #9ca3af; }

    .modal-select { width: 100%; border-radius: 12px; border: 1.5px solid #e5e7eb; padding: 10px 14px; font-size: 13px; color: #111827; font-family: 'DM Sans', sans-serif; outline: none; transition: border-color .15s; background: #fff; appearance: none; }
    .modal-select:focus { border-color: #6366f1; box-shadow: 0 0 0 3px #e0e7ff; }

    .modal-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; color: #6b7280; margin-bottom: 6px; }

    .etapa-banner { border-radius: 14px; padding: 12px 18px; display: flex; align-items: center; gap: 10px; font-size: 13px; }
    .etapa-banner-bandeja      { background: #eef2ff; color: #3730a3; border: 1px solid #c7d2fe; }
    .etapa-banner-revision     { background: #fffbeb; color: #92400e; border: 1px solid #fde68a; }
    .etapa-banner-aprobaciones { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }

    .empty-state { border-radius: 20px; border: 2px dashed #e5e7eb; padding: 60px 20px; text-align: center; background: #fafafa; }
    .detalle-text { font-size: 13px; color: #6b7280; line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .sep { color: #d1d5db; }
    .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: #9ca3af; margin-bottom: 10px; }
</style>

<div class="gos-wrap space-y-5">

    <div class="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
                <div class="flex items-center gap-2 mb-1">
                    <span class="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-600 text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                        </svg>
                    </span>
                    <h1 class="text-xl font-bold tracking-tight text-gray-900">Gestión Operativa de Solicitudes</h1>
                </div>
                <p class="text-sm text-gray-400 pl-10">Recepción · Revisión · Aprobación en un solo flujo</p>
            </div>
            <div class="flex gap-2 flex-wrap">
                <button wire:click="setMesActual" class="inline-flex items-center gap-1.5 text-xs font-600 px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-all font-semibold">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    Mes actual
                </button>
                <button wire:click="limpiarFiltros" class="inline-flex items-center gap-1.5 text-xs font-600 px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-all font-semibold">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    Limpiar filtros
                </button>
            </div>
        </div>

        @php $etapasDisponibles = $this->etapasDisponibles(); @endphp
        <div class="mt-6 grid grid-cols-3 gap-3">
            <button wire:click="cambiarEtapa('bandeja')" class="gos-step text-left {{ $etapa === 'bandeja' ? 'active-bandeja' : '' }} {{ !in_array('bandeja', $etapasDisponibles) ? 'locked' : '' }}">
                <div class="step-num {{ $etapa === 'bandeja' ? 'step-num-bandeja' : 'step-num-inactive' }}">1</div>
                <div class="text-sm font-bold text-gray-900">Bandeja Operativa</div>
                <div class="text-xs text-gray-400 mt-0.5 leading-snug">Recepción, clasificación y prioridad inicial.</div>
                @if(!in_array('bandeja', $etapasDisponibles))
                    <div class="mt-3 text-xs font-semibold text-gray-300">🔒 Sin acceso</div>
                @else
                    <div class="mt-3 text-xs font-semibold {{ $etapa === 'bandeja' ? 'text-indigo-600' : 'text-gray-300' }}">{{ $etapa === 'bandeja' ? '● Activo' : '○ Ir a bandeja' }}</div>
                @endif
            </button>
            <button wire:click="cambiarEtapa('revision')" class="gos-step text-left {{ $etapa === 'revision' ? 'active-revision' : '' }} {{ !in_array('revision', $etapasDisponibles) ? 'locked' : '' }}">
                <div class="step-num {{ $etapa === 'revision' ? 'step-num-revision' : 'step-num-inactive' }}">2</div>
                <div class="text-sm font-bold text-gray-900">Revisión Operativa</div>
                <div class="text-xs text-gray-400 mt-0.5 leading-snug">Validación técnica, observaciones y derivación.</div>
                @if(!in_array('revision', $etapasDisponibles))
                    <div class="mt-3 text-xs font-semibold text-gray-300">🔒 Sin acceso</div>
                @else
                    <div class="mt-3 text-xs font-semibold {{ $etapa === 'revision' ? 'text-amber-600' : 'text-gray-300' }}">{{ $etapa === 'revision' ? '● Activo' : '○ Ir a revisión' }}</div>
                @endif
            </button>
            <button wire:click="cambiarEtapa('aprobaciones')" class="gos-step text-left {{ $etapa === 'aprobaciones' ? 'active-aprobaciones' : '' }} {{ !in_array('aprobaciones', $etapasDisponibles) ? 'locked' : '' }}">
                <div class="step-num {{ $etapa === 'aprobaciones' ? 'step-num-aprobaciones' : 'step-num-inactive' }}">3</div>
                <div class="text-sm font-bold text-gray-900">Aprobaciones</div>
                <div class="text-xs text-gray-400 mt-0.5 leading-snug">Resolución administrativa y cierre de decisión.</div>
                @if(!in_array('aprobaciones', $etapasDisponibles))
                    <div class="mt-3 text-xs font-semibold text-gray-300">🔒 Sin acceso</div>
                @else
                    <div class="mt-3 text-xs font-semibold {{ $etapa === 'aprobaciones' ? 'text-emerald-600' : 'text-gray-300' }}">{{ $etapa === 'aprobaciones' ? '● Activo' : '○ Ir a aprobaciones' }}</div>
                @endif
            </button>
        </div>

        <div class="mt-4 etapa-banner etapa-banner-{{ $etapa }}">
            @if($etapa === 'bandeja')
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>
            @elseif($etapa === 'revision')
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
            @else
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            @endif
            <span class="font-medium">{{ $this->etapaLabel() }}</span>
        </div>
    </div>

    <div class="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
        <div class="section-title">Filtros</div>
        {{ $this->form }}
    </div>

    <div class="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <div class="kpi-card">
            <div class="meta-label">Total</div>
            <div class="kpi-value text-gray-900">{{ $kpi_total }}</div>
            <div class="mt-2 text-xs text-gray-400">solicitudes en etapa</div>
        </div>
        <div class="kpi-card">
            <div class="meta-label">{{ $kpi_a_label }}</div>
            <div class="kpi-value text-indigo-600">{{ $kpi_a }}</div>
            <div class="mt-2 text-xs text-gray-400">@if($kpi_total > 0) {{ round(($kpi_a / $kpi_total) * 100) }}% del total @else — @endif</div>
        </div>
        <div class="kpi-card">
            <div class="meta-label">{{ $kpi_b_label }}</div>
            <div class="kpi-value text-amber-500">{{ $kpi_b }}</div>
            <div class="mt-2 text-xs text-gray-400">@if($kpi_total > 0) {{ round(($kpi_b / $kpi_total) * 100) }}% del total @else — @endif</div>
        </div>
        <div class="kpi-card">
            <div class="meta-label">{{ $kpi_c_label }}</div>
            <div class="kpi-value text-emerald-500">{{ $kpi_c }}</div>
            <div class="mt-2 text-xs text-gray-400">@if($kpi_total > 0) {{ round(($kpi_c / $kpi_total) * 100) }}% del total @else — @endif</div>
        </div>
    </div>

    <div class="space-y-3">
        @forelse ($this->paginatedRows as $row)
            @php
                $estadoKey = $row['estado'] ?? '';
                $estadoBadgeClass = match($estadoKey) {
                    'pendiente'    => 'badge-pendiente',
                    'en_revision'  => 'badge-revision',
                    'pre_aprobada' => 'badge-preaprobada',
                    'aprobada'     => 'badge-aprobada',
                    'rechazada'    => 'badge-rechazada',
                    'condicionada' => 'badge-condicionada',
                    default        => 'badge-default',
                };
                $prioridadKey = strtolower($row['prioridad'] ?? '');
                $prioBadgeClass = match($prioridadKey) {
                    'alta'  => 'badge-alta',
                    'media' => 'badge-media',
                    'baja'  => 'badge-baja',
                    default => 'badge-default',
                };
                $uid = $row['tipo'] . $row['id'];
                $fechaIngreso = !empty($row['fecha_ingreso']) ? \Carbon\Carbon::parse($row['fecha_ingreso']) : null;
                $edadHumana   = $fechaIngreso ? $fechaIngreso->diffForHumans() : null;
                $edadHoras    = $fechaIngreso ? $fechaIngreso->diffInHours(now()) : 0;
                $edadClase    = match(true) {
                    $edadHoras >= 48 => 'urgente',
                    $edadHoras >= 24 => 'atencion',
                    default          => '',
                };
                $asignadoNombre = $row['asignado'] ?? null;
            @endphp

            <div class="sol-card" wire:key="row-{{ $uid }}">
                <div class="sol-card-header">
                    <span class="badge badge-tipo">
                        @if($row['tipo'] === 'transporte') 🚗
                        @elseif($row['tipo'] === 'combustible') ⛽
                        @else 🔧 @endif
                        {{ ucfirst($row['tipo']) }}
                    </span>
                    <span class="mono text-sm font-semibold text-gray-800">{{ $row['codigo'] }}</span>
                    <span class="sep text-xs">•</span>
                    <span class="text-xs text-gray-400">{{ $fechaIngreso ? $fechaIngreso->format('d/m/Y H:i') : '—' }}</span>
                    @if($edadHumana)
                        <span class="edad-chip {{ $edadClase }}" title="Ingresó {{ $fechaIngreso->format('d/m/Y H:i') }}">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                            {{ $edadHumana }}
                            @if($edadClase === 'urgente') ⚠️ @elseif($edadClase === 'atencion') ⏳ @endif
                        </span>
                    @endif
                    <span class="ml-auto flex items-center gap-2">
                        <span class="badge {{ $prioBadgeClass }}">{{ strtoupper($prioridadKey ?: '—') }}</span>
                        <span class="badge {{ $estadoBadgeClass }}">{{ ucfirst(str_replace('_', ' ', $estadoKey)) }}</span>
                    </span>
                </div>

                <div class="sol-card-body">
                    <div class="meta-grid">
                        <div><div class="meta-label">Solicitante</div><div class="meta-value">{{ $row['solicitante'] }}</div></div>
                        <div><div class="meta-label">Unidad</div><div class="meta-value">{{ $row['unidad'] }}</div></div>
                        <div><div class="meta-label">ID</div><div class="meta-value mono">{{ $row['id'] }}</div></div>
                        <div>
                            <div class="meta-label">Asignado a</div>
                            <div class="meta-value mt-1">
                                @if($asignadoNombre)
                                    <span class="asignado-chip"><svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>{{ $asignadoNombre }}</span>
                                @else
                                    <span class="asignado-chip sin-asignar"><svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>Sin asignar</span>
                                @endif
                            </div>
                        </div>
                    </div>
                    @if(!empty($row['detalle']))
                        <div class="mt-4 pt-4 border-t border-gray-100">
                            <div class="meta-label">Detalle</div>
                            <p class="detalle-text mt-1">{{ $row['detalle'] }}</p>
                        </div>
                    @endif
                </div>

                <div class="sol-card-actions">

                    {{-- ── BANDEJA ─────────────────────────────────────── --}}
                    @if($etapa === 'bandeja')
                        @if($row['estado'] === 'pendiente')
                            <button wire:click="tomarParaRevision('{{ $row['tipo'] }}', {{ $row['id'] }})" class="btn-accion btn-indigo">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                                Tomar para revisión
                            </button>
                        @endif
                        <div class="flex items-center gap-1.5 ml-auto">
                            <span class="text-xs text-gray-400 mr-1">Prioridad:</span>
                            <button wire:click="cambiarPrioridad('{{ $row['tipo'] }}', {{ $row['id'] }}, 'alta')"  class="prio-btn prio-alta">Alta</button>
                            <button wire:click="cambiarPrioridad('{{ $row['tipo'] }}', {{ $row['id'] }}, 'media')" class="prio-btn prio-media">Media</button>
                            <button wire:click="cambiarPrioridad('{{ $row['tipo'] }}', {{ $row['id'] }}, 'baja')"  class="prio-btn prio-baja">Baja</button>
                        </div>
                    @endif

                    {{-- ── REVISIÓN ────────────────────────────────────── --}}
                    @if($etapa === 'revision')
                        <x-filament::modal width="2xl">
                            <x-slot name="trigger"><button class="btn-accion btn-success"><svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>Validar</button></x-slot>
                            <x-slot name="heading">Validar y enviar a preaprobación</x-slot>
                            <form wire:submit.prevent="validar('{{ $row['tipo'] }}', {{ $row['id'] }}, {
                                comentario: $refs.comentarioVal{{ $uid }}.value,
                                datos_completos: $refs.datosVal{{ $uid }}.checked,
                                fechas_validas: $refs.fechasVal{{ $uid }}.checked,
                                recursos_disponibles: $refs.recursosVal{{ $uid }}.checked,
                                reglas_minimas: $refs.reglasVal{{ $uid }}.checked,
                                hallazgos: $refs.hallazgosVal{{ $uid }}.value
                            })" class="space-y-4 pt-2">
                                <div><div class="modal-label">Checklist de validación</div>
                                <div class="modal-check-grid">
                                    <label class="check-item"><input type="checkbox" x-ref="datosVal{{ $uid }}"> Datos completos</label>
                                    <label class="check-item"><input type="checkbox" x-ref="fechasVal{{ $uid }}"> Fechas válidas</label>
                                    <label class="check-item"><input type="checkbox" x-ref="recursosVal{{ $uid }}"> Recursos disponibles</label>
                                    <label class="check-item"><input type="checkbox" x-ref="reglasVal{{ $uid }}"> Reglas mínimas</label>
                                </div></div>
                                <div><div class="modal-label">Hallazgos (opcional)</div><textarea x-ref="hallazgosVal{{ $uid }}" class="modal-textarea" rows="2" placeholder="Describe hallazgos encontrados..."></textarea></div>
                                <div><div class="modal-label">Comentario de validación <span class="text-red-400">*</span></div><textarea x-ref="comentarioVal{{ $uid }}" class="modal-textarea" rows="3" placeholder="Comentario final de revisión..." required></textarea></div>
                                <div class="flex justify-end pt-2"><button type="submit" class="btn-accion btn-success"><svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>Enviar a preaprobación</button></div>
                            </form>
                        </x-filament::modal>

                        <x-filament::modal width="2xl">
                            <x-slot name="trigger"><button class="btn-accion btn-gray"><svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>Observar</button></x-slot>
                            <x-slot name="heading">Registrar observación técnica</x-slot>
                            <form wire:submit.prevent="observarRevision('{{ $row['tipo'] }}', {{ $row['id'] }}, {
                                comentario: $refs.comentarioObs{{ $uid }}.value,
                                datos_completos: $refs.datosObs{{ $uid }}.checked,
                                fechas_validas: $refs.fechasObs{{ $uid }}.checked,
                                recursos_disponibles: $refs.recursosObs{{ $uid }}.checked,
                                reglas_minimas: $refs.reglasObs{{ $uid }}.checked,
                                hallazgos: $refs.hallazgosObs{{ $uid }}.value
                            })" class="space-y-4 pt-2">
                                <div><div class="modal-label">Checklist</div>
                                <div class="modal-check-grid">
                                    <label class="check-item"><input type="checkbox" x-ref="datosObs{{ $uid }}"> Datos completos</label>
                                    <label class="check-item"><input type="checkbox" x-ref="fechasObs{{ $uid }}"> Fechas válidas</label>
                                    <label class="check-item"><input type="checkbox" x-ref="recursosObs{{ $uid }}"> Recursos disponibles</label>
                                    <label class="check-item"><input type="checkbox" x-ref="reglasObs{{ $uid }}"> Reglas mínimas</label>
                                </div></div>
                                <div><div class="modal-label">Hallazgos técnicos (opcional)</div><textarea x-ref="hallazgosObs{{ $uid }}" class="modal-textarea" rows="2" placeholder="Describe hallazgos técnicos..."></textarea></div>
                                <div><div class="modal-label">Comentario / devolución <span class="text-red-400">*</span></div><textarea x-ref="comentarioObs{{ $uid }}" class="modal-textarea" rows="3" placeholder="Comentario de devolución..." required></textarea></div>
                                <div class="flex justify-end pt-2"><button type="submit" class="btn-accion btn-gray">Guardar observación</button></div>
                            </form>
                        </x-filament::modal>

                        <x-filament::modal width="2xl">
                            <x-slot name="trigger"><button class="btn-accion btn-warning"><svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>Derivar</button></x-slot>
                            <x-slot name="heading">Derivar solicitud a otro usuario</x-slot>
                            <form wire:submit.prevent="derivar('{{ $row['tipo'] }}', {{ $row['id'] }}, {
                                derivado_a: $refs.usuarioDer{{ $uid }}.value,
                                comentario: $refs.comentarioDer{{ $uid }}.value,
                                datos_completos: $refs.datosDer{{ $uid }}.checked,
                                fechas_validas: $refs.fechasDer{{ $uid }}.checked,
                                recursos_disponibles: $refs.recursosDer{{ $uid }}.checked,
                                reglas_minimas: $refs.reglasDer{{ $uid }}.checked,
                                hallazgos: $refs.hallazgosDer{{ $uid }}.value
                            })" class="space-y-4 pt-2">
                                <div><div class="modal-label">Derivar a <span class="text-red-400">*</span></div>
                                <select x-ref="usuarioDer{{ $uid }}" class="modal-select" required>
                                    <option value="">Seleccione un usuario</option>
                                    @foreach($this->usuariosOptions() as $uid_u => $nombre)
                                        <option value="{{ $uid_u }}">{{ $nombre }}</option>
                                    @endforeach
                                </select></div>
                                <div><div class="modal-label">Checklist</div>
                                <div class="modal-check-grid">
                                    <label class="check-item"><input type="checkbox" x-ref="datosDer{{ $uid }}"> Datos completos</label>
                                    <label class="check-item"><input type="checkbox" x-ref="fechasDer{{ $uid }}"> Fechas válidas</label>
                                    <label class="check-item"><input type="checkbox" x-ref="recursosDer{{ $uid }}"> Recursos disponibles</label>
                                    <label class="check-item"><input type="checkbox" x-ref="reglasDer{{ $uid }}"> Reglas mínimas</label>
                                </div></div>
                                <div><div class="modal-label">Hallazgos (opcional)</div><textarea x-ref="hallazgosDer{{ $uid }}" class="modal-textarea" rows="2" placeholder="Hallazgos relevantes..."></textarea></div>
                                <div><div class="modal-label">Comentario de derivación <span class="text-red-400">*</span></div><textarea x-ref="comentarioDer{{ $uid }}" class="modal-textarea" rows="3" placeholder="Explica el motivo de la derivación..." required></textarea></div>
                                <div class="flex justify-end pt-2"><button type="submit" class="btn-accion btn-warning"><svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>Confirmar derivación</button></div>
                            </form>
                        </x-filament::modal>
                    @endif

                    {{-- ── APROBACIONES ────────────────────────────────── --}}
                    @if($etapa === 'aprobaciones')

                        {{-- ═══ APROBAR — Alpine.js con canvas de firma ═══ --}}
                        <div
                            x-data="{
                                open: false,
                                comentario: '',
                                firma: null,
                                drawing: false,
                                lastX: 0,
                                lastY: 0,

                                openModal() {
                                    this.comentario = '';
                                    this.firma = null;
                                    this.open = true;
                                    @if(in_array($row['tipo'], ['transporte', 'mantenimiento']))
                                    setTimeout(() => {
                                        const c = document.getElementById('firma-gos-{{ $row['id'] }}');
                                        if (!c) return;
                                        const ctx = c.getContext('2d');
                                        ctx.strokeStyle = '#1e3a5f';
                                        ctx.lineWidth = 2;
                                        ctx.lineCap = 'round';
                                        ctx.lineJoin = 'round';
                                        ctx.clearRect(0, 0, c.width, c.height);
                                    }, 50);
                                    @endif
                                },

                                getPos(e, c) {
                                    const rect = c.getBoundingClientRect();
                                    const src = e.touches ? e.touches[0] : e;
                                    return {
                                        x: (src.clientX - rect.left) * (c.width / rect.width),
                                        y: (src.clientY - rect.top) * (c.height / rect.height),
                                    };
                                },

                                startDraw(e) {
                                    e.preventDefault();
                                    const c = document.getElementById('firma-gos-{{ $row['id'] }}');
                                    if (!c) return;
                                    this.drawing = true;
                                    const p = this.getPos(e, c);
                                    this.lastX = p.x; this.lastY = p.y;
                                },

                                onDraw(e) {
                                    if (!this.drawing) return;
                                    e.preventDefault();
                                    const c = document.getElementById('firma-gos-{{ $row['id'] }}');
                                    if (!c) return;
                                    const ctx = c.getContext('2d');
                                    const p = this.getPos(e, c);
                                    ctx.beginPath();
                                    ctx.moveTo(this.lastX, this.lastY);
                                    ctx.lineTo(p.x, p.y);
                                    ctx.stroke();
                                    this.lastX = p.x; this.lastY = p.y;
                                },

                                stopDraw() {
                                    if (!this.drawing) return;
                                    this.drawing = false;
                                    const c = document.getElementById('firma-gos-{{ $row['id'] }}');
                                    if (c) this.firma = c.toDataURL('image/png');
                                },

                                clearFirma() {
                                    const c = document.getElementById('firma-gos-{{ $row['id'] }}');
                                    if (!c) return;
                                    c.getContext('2d').clearRect(0, 0, c.width, c.height);
                                    this.firma = null;
                                },

                                confirmar() {
                                    if (!this.comentario.trim()) return;
                                    $wire.aprobar(
                                        '{{ $row['tipo'] }}',
                                        {{ $row['id'] }},
                                        { comentario: this.comentario, firma: this.firma }
                                    );
                                    this.open = false;
                                }
                            }"
                        >
                            <button class="btn-accion btn-success" @click="openModal()">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                                Aprobar
                            </button>

                            {{-- Overlay --}}
                            <div x-show="open" x-transition.opacity class="fixed inset-0 z-40 bg-black/50" @click="open = false" style="display:none"></div>

                            {{-- Dialog --}}
                            <div x-show="open" x-transition class="fixed inset-0 z-50 flex items-center justify-center p-4" style="display:none">
                                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4">

                                    <h2 class="text-base font-semibold text-gray-900 dark:text-white">
                                        Aprobar solicitud — <span class="font-mono text-gray-400 text-sm">{{ $row['codigo'] }}</span>
                                    </h2>

                                    <div>
                                        <div class="modal-label">Comentario de aprobación <span class="text-red-400">*</span></div>
                                        <textarea x-model="comentario" class="modal-textarea" rows="4" placeholder="Deja un comentario de aprobación..."></textarea>
                                    </div>

                                    @if(in_array($row['tipo'], ['transporte', 'mantenimiento']))
                                    <div>
                                        <div class="modal-label">Firma del aprobador <span class="text-gray-400 font-normal text-xs">(aparecerá en el PDF)</span></div>
                                        <div class="border border-gray-300 rounded-lg overflow-hidden bg-white" style="touch-action: none;">
                                            <canvas
                                                id="firma-gos-{{ $row['id'] }}"
                                                width="560"
                                                height="150"
                                                style="width:100%; height:150px; cursor:crosshair; display:block;"
                                                @mousedown="startDraw"
                                                @mousemove="onDraw"
                                                @mouseup="stopDraw"
                                                @mouseleave="stopDraw"
                                                @touchstart="startDraw"
                                                @touchmove="onDraw"
                                                @touchend="stopDraw"
                                            ></canvas>
                                        </div>
                                        <button type="button" @click="clearFirma" class="mt-1 text-xs text-red-500 hover:text-red-700 underline">✕ Limpiar firma</button>
                                    </div>
                                    @endif

                                    <div class="flex justify-end gap-3 pt-2">
                                        <button type="button" class="btn-accion btn-gray" @click="open = false">Cancelar</button>
                                        <button type="button" class="btn-accion btn-success" @click="confirmar" x-bind:disabled="!comentario.trim()">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                                            Confirmar aprobación
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {{-- ═══════════════════════════════════════════════ --}}

                        {{-- Rechazar --}}
                        <x-filament::modal width="xl">
                            <x-slot name="trigger"><button class="btn-accion btn-danger"><svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>Rechazar</button></x-slot>
                            <x-slot name="heading">Rechazar solicitud</x-slot>
                            <form wire:submit.prevent="rechazar('{{ $row['tipo'] }}', {{ $row['id'] }}, {
                                comentario: $refs.rechazarComentario{{ $uid }}.value
                            })" class="space-y-4 pt-2">
                                <div><div class="modal-label">Motivo del rechazo <span class="text-red-400">*</span></div><textarea x-ref="rechazarComentario{{ $uid }}" class="modal-textarea" rows="4" placeholder="Explica el motivo del rechazo..." required></textarea></div>
                                <div class="flex justify-end pt-2"><button type="submit" class="btn-accion btn-danger">Confirmar rechazo</button></div>
                            </form>
                        </x-filament::modal>

                        {{-- Condicionar --}}
                        <x-filament::modal width="xl">
                            <x-slot name="trigger"><button class="btn-accion btn-warning"><svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>Condicionar</button></x-slot>
                            <x-slot name="heading">Condicionar solicitud</x-slot>
                            <form wire:submit.prevent="condicionar('{{ $row['tipo'] }}', {{ $row['id'] }}, {
                                comentario: $refs.condComentario{{ $uid }}.value
                            })" class="space-y-4 pt-2">
                                <div><div class="modal-label">Condiciones requeridas <span class="text-red-400">*</span></div><textarea x-ref="condComentario{{ $uid }}" class="modal-textarea" rows="4" placeholder="Describe las condiciones requeridas..." required></textarea></div>
                                <div class="flex justify-end pt-2"><button type="submit" class="btn-accion btn-warning">Enviar con condiciones</button></div>
                            </form>
                        </x-filament::modal>

                        {{-- Reabrir --}}
                        <x-filament::modal width="xl">
                            <x-slot name="trigger"><button class="btn-accion btn-gray"><svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>Reabrir</button></x-slot>
                            <x-slot name="heading">Reabrir solicitud</x-slot>
                            <form wire:submit.prevent="reabrir('{{ $row['tipo'] }}', {{ $row['id'] }}, {
                                comentario: $refs.reabrirComentario{{ $uid }}.value
                            })" class="space-y-4 pt-2">
                                <div><div class="modal-label">Motivo para reabrir <span class="text-red-400">*</span></div><textarea x-ref="reabrirComentario{{ $uid }}" class="modal-textarea" rows="4" placeholder="Justifica la reapertura..." required></textarea></div>
                                <div class="flex justify-end pt-2"><button type="submit" class="btn-accion btn-gray">Confirmar reapertura</button></div>
                            </form>
                        </x-filament::modal>

                    @endif

                </div>
            </div>

        @empty
            <div class="empty-state">
                <div class="text-4xl mb-4">📭</div>
                <div class="text-base font-semibold text-gray-500">No hay solicitudes en esta etapa</div>
                <div class="text-sm text-gray-400 mt-1">Prueba ajustando los filtros o cambiando el rango de fechas.</div>
            </div>
        @endforelse
    </div>

    <div class="pt-1">
        {{ $this->paginatedRows->links() }}
    </div>

</div>
</x-filament-panels::page>