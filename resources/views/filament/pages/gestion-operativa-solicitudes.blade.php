<x-filament-panels::page>

{{-- ── ESTILOS GLOBALES DE LA PÁGINA ─────────────────────────────────────── --}}
<style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');

    /* Parche para corregir las flechas repetidas del Select de Filament por minificación */
    .fi-fo-select select, 
    .fi-select-input,
    [multiple], select {
        background-repeat: no-repeat !important;
        background-position: right 0.75rem center !important;
        background-size: 1.5em 1.5em !important;
    }

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
    .badge-grupo   { font-size: 12px; font-weight: 800; letter-spacing: .06em; padding: 4px 14px; border-radius: 999px; text-transform: uppercase; }
    .badge-g-critica { background: #7c1d1d; color: #fff; border: 1.5px solid #991b1b; box-shadow: 0 0 0 2px #fca5a5; }
    .badge-g-alta    { background: #92400e; color: #fff; border: 1.5px solid #d97706; }
    .badge-g-media   { background: #c2410c; color: #fff; border: 1.5px solid #ea580c; }
    .badge-g-baja    { background: #4b5563; color: #fff; border: 1.5px solid #6b7280; }
    .badge-alta   { background: #fef3c7; color: #92400e; }
    .badge-media  { background: #ffedd5; color: #c2410c; }
    .badge-baja   { background: #f3f4f6; color: #6b7280; }

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
    .comparativa-col { border-radius: 16px; border: 1.5px solid #e5e7eb; background: #fff; padding: 16px; }
    .comparativa-col.sistema  { border-color: #c7d2fe; background: #eef2ff; }
    .comparativa-col.operativo { border-color: #fde68a; background: #fffbeb; }
    .comparativa-col.jefe     { border-color: #a7f3d0; background: #ecfdf5; }
    .comp-label { font-size: 10px; text-transform: uppercase; letter-spacing: .06em; color: #9ca3af; font-weight: 600; margin-bottom: 2px; }
    .comp-value { font-size: 13px; font-weight: 500; color: #111827; }
    .comp-score { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 700; padding: 2px 10px; border-radius: 999px; }
    .comp-score-alto  { background: #d1fae5; color: #065f46; }
    .comp-score-medio { background: #fef3c7; color: #92400e; }
    .comp-score-bajo  { background: #fee2e2; color: #991b1b; }
    .comp-bullet { font-size: 11px; color: #6b7280; padding: 2px 0; }
    .comp-bullet::before { content: '▹ '; color: #6366f1; }
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
                $grupoKey = strtolower($row['prioridad_grupo'] ?? '');
                $grupoBadgeClass = match($grupoKey) {
                    'critica' => 'badge-g-critica',
                    'alta'    => 'badge-g-alta',
                    'media'   => 'badge-g-media',
                    'baja'    => 'badge-g-baja',
                    default   => 'badge-default',
                };
                $grupoNombreRaw = $row['grupo_nombre'] ?? '';
                $grupoLabel = $grupoNombreRaw
                    ? mb_strtoupper($grupoNombreRaw) . ($grupoKey ? ' (' . strtoupper($grupoKey) . ')' : '')
                    : ($grupoKey ? strtoupper($grupoKey) : '—');
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
                        <span class="badge-grupo {{ $grupoBadgeClass }}">{{ $grupoLabel }}</span>
                        <span class="badge {{ $prioBadgeClass }}" style="font-size:10px;">{{ strtoupper($prioridadKey ?: '—') }}</span>
                        <span class="badge {{ $estadoBadgeClass }}">{{ ucfirst(str_replace('_', ' ', $estadoKey)) }}</span>
                    </span>
                </div>

                <div class="sol-card-body">
                    <div class="meta-grid">
                        <div><div class="meta-label">Solicitante</div><div class="meta-value">{{ $row['solicitante'] }}</div></div>
                        <div><div class="meta-label">Unidad</div><div class="meta-value">{{ $row['unidad'] }}</div></div>
                        @if($row['tipo'] === 'transporte' && !empty($row['tipo_vehiculo_nombre']))
                        <div><div class="meta-label">Vehículo pedido</div><div class="meta-value">{{ $row['tipo_vehiculo_nombre'] }}</div></div>
                        @endif
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

                        @if($row['tipo'] === 'transporte' && $row['estado'] === 'en_revision')
                        @php $sugerenciaData = $this->getSugerencia($row['id']); @endphp
                        <div x-data="{
                            open: false,
                            vehiculoId: null,
                            motoristaId: null,
                            justificacion: '',
                            vehiculos: @js($this->getVehiculosConMotorista()),
                            sugerencia: @json($sugerenciaData),
                            get cambio() {
                                if (!this.sugerencia) return 'ninguno';
                                const cv = this.vehiculoId && this.sugerencia.vehiculo_sugerido_id !== this.vehiculoId;
                                const cm = this.motoristaId && this.sugerencia.motorista_sugerido_id !== this.motoristaId;
                                if (cv && cm) return 'ambos';
                                if (cv) return 'vehiculo';
                                if (cm) return 'chofer';
                                return 'ninguno';
                            },
                            onVehiculoChange() {
                                const v = this.vehiculos[this.vehiculoId];
                                if (v && v.motorista_id) {
                                    this.motoristaId = v.motorista_id;
                                } else {
                                    this.motoristaId = '';
                                }
                            }
                        }">
                            <button class="btn-accion btn-indigo" @click="open = true">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                                Asignar recursos
                            </button>
                            <div x-show="open" x-transition.opacity class="fixed inset-0 z-40 bg-black/50" @click="open = false" style="display:none"></div>
                            <div x-show="open" x-transition class="fixed inset-0 z-50 flex items-center justify-center p-4" style="display:none">
                                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4" @click.stop>
                                    <h2 class="text-base font-semibold text-gray-900 dark:text-white">
                                        Asignar recursos — <span class="font-mono text-gray-400 text-sm">{{ $row['codigo'] }}</span>
                                    </h2>
                                    @if(!empty($row['tipo_vehiculo_nombre']))
                                    <div class="text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                                        Solicitó: <strong>{{ $row['tipo_vehiculo_nombre'] }}</strong>
                                    </div>
                                    @endif
                                    @if($sugerenciaData)
                                    <div class="text-xs text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-600">
                                        Sistema sugiere: <strong>{{ $sugerenciaData['vehiculo_sugerido_placa'] ?? '?' }}</strong>
                                        con <strong>{{ $sugerenciaData['motorista_sugerido_nombre'] ?? '?' }}</strong>
                                    </div>
                                    @endif
                                    <div><div class="modal-label">Vehículo <span class="text-red-400">*</span></div>
                                    <select x-model="vehiculoId" class="modal-select" @change="onVehiculoChange">
                                        <option value="">Seleccione un vehículo</option>
                                        @foreach($this->vehiculosDisponibles() as $vId => $vPlaca)
                                        <option value="{{ $vId }}">{{ $vPlaca }}</option>
                                        @endforeach
                                    </select></div>
                                    <div><div class="modal-label">Motorista <span class="text-red-400">*</span></div>
                                    <select x-model="motoristaId" class="modal-select">
                                        <option value="">Seleccione un motorista</option>
                                        @foreach($this->motoristasDisponibles() as $mId => $mNombre)
                                        <option value="{{ $mId }}">{{ $mNombre }}</option>
                                        @endforeach
                                    </select></div>
                                    <div x-show="cambio !== 'ninguno'">
                                        <div class="modal-label">Justificación <span class="text-red-400">*</span></div>
                                        <textarea x-model="justificacion" class="modal-textarea" rows="3" placeholder="Indica por qué cambias los recursos sugeridos..."></textarea>
                                    </div>
                                    <div class="flex justify-end gap-3 pt-2">
                                        <button type="button" class="btn-accion btn-gray" @click="open = false">Cancelar</button>
                                        <button type="button" class="btn-accion btn-success"
                                            @click="$wire.asignarRecursosDesdeFilament({{ $row['id'] }}, vehiculoId, motoristaId, justificacion || null); open = false"
                                            x-bind:disabled="!vehiculoId || !motoristaId || (cambio !== 'ninguno' && !justificacion.trim())">
                                            Confirmar asignación
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        @endif
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

                        {{-- ═══ TRANSPORTE: Comparativa 3 columnas ═══ --}}
                        @if($row['tipo'] === 'transporte' && $row['estado'] === 'pre_aprobada' && $row['sugerencia'])
                        <div x-data="{ open: false }">
                            <button class="btn-accion btn-gray" @click="open = true">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7"/></svg>
                                Comparativa
                            </button>
                            <div x-show="open" x-transition.opacity class="fixed inset-0 z-40 bg-black/50" @click="open = false" style="display:none"></div>
                            <div x-show="open" x-transition class="fixed inset-0 z-50 flex items-center justify-center p-4" style="display:none">
                                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl p-6 space-y-4" @click.stop>
                                    <h2 class="text-base font-semibold text-gray-900 dark:text-white">
                                        Comparativa — <span class="font-mono text-gray-400 text-sm">{{ $row['codigo'] }}</span>
                                    </h2>
                                    @php $sug = $row['sugerencia']; $dec = $row['decision_operativa']; $score = $sug['score_confianza'] ?? 0; @endphp
                                    <div class="grid grid-cols-3 gap-4">
                                        {{-- Col 1: Sistema --}}
                                        <div class="comparativa-col sistema">
                                            <div class="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3">🤖 Sistema</div>
                                            <div class="space-y-2">
                                                <div><div class="comp-label">Vehículo</div><div class="comp-value">{{ $sug['vehiculo'] ?? '—' }}</div></div>
                                                <div><div class="comp-label">Motorista</div><div class="comp-value">{{ $sug['motorista'] ?? '—' }}</div></div>
                                                <div><div class="comp-label">Confianza</div>
                                                    <span class="comp-score {{ $score >= 70 ? 'comp-score-alto' : ($score >= 40 ? 'comp-score-medio' : 'comp-score-bajo') }}">
                                                        {{ number_format($score, 0) }}%
                                                    </span>
                                                </div>
                                                <div><div class="comp-label">Combustible</div><div class="comp-value">{{ number_format($sug['combustible_porcentaje'] ?? 0, 0) }}%</div></div>
                                                <div><div class="comp-label">Horas (7d)</div><div class="comp-value">{{ number_format($sug['horas_motorista_periodo'] ?? 0, 1) }}h</div></div>
                                                @if(!empty($sug['bullets_tecnicos']))
                                                <div class="pt-2 border-t border-indigo-200">
                                                    <div class="comp-label mb-1">Detalles técnicos</div>
                                                    @foreach((array)$sug['bullets_tecnicos'] as $bullet)
                                                    <div class="comp-bullet">{{ $bullet }}</div>
                                                    @endforeach
                                                </div>
                                                @endif
                                            </div>
                                        </div>
                                        {{-- Col 2: Operativo --}}
                                        <div class="comparativa-col operativo">
                                            <div class="text-xs font-bold text-amber-600 uppercase tracking-wider mb-3">👤 Operativo</div>
                                            <div class="space-y-2">
                                                @if($dec)
                                                <div><div class="comp-label">Vehículo</div><div class="comp-value">{{ $dec['vehiculo'] ?? '—' }}</div></div>
                                                <div><div class="comp-label">Motorista</div><div class="comp-value">{{ $dec['motorista'] ?? '—' }}</div></div>
                                                <div><div class="comp-label">Cambio</div>
                                                    <span class="text-xs font-semibold {{ $dec['cambio_detectado'] === 'ninguno' ? 'text-green-600' : 'text-red-500' }}">
                                                        {{ $dec['cambio_detectado'] === 'ninguno' ? 'Sin cambios' : strtoupper($dec['cambio_detectado']) }}
                                                    </span>
                                                </div>
                                                @if($dec['justificacion'])
                                                <div><div class="comp-label">Justificación</div><div class="comp-value text-xs italic">{{ $dec['justificacion'] }}</div></div>
                                                @endif
                                                @else
                                                <div class="text-sm text-gray-400 italic">Sin decisión operativa registrada</div>
                                                @endif
                                            </div>
                                        </div>
                                        {{-- Col 3: Jefe --}}
                                        <div class="comparativa-col jefe">
                                            <div class="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-3">⚖️ Jefe</div>
                                            <div class="space-y-2">
                                                @if($row['decision_final'])
                                                <div><div class="comp-label">Decisión final</div>
                                                    <span class="text-sm font-bold {{ $row['decision_final'] === 'sistema' ? 'text-indigo-600' : 'text-amber-600' }}">
                                                        {{ $row['decision_final'] === 'sistema' ? 'Sugerencia del Sistema' : 'Asignación del Operativo' }}
                                                    </span>
                                                </div>
                                                @else
                                                <div class="text-sm text-gray-400 italic">Pendiente de decisión</div>
                                                @endif
                                            </div>
                                        </div>
                                    </div>
                                    <div class="flex justify-end pt-2">
                                        <button type="button" class="btn-accion btn-gray" @click="open = false">Cerrar</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {{-- ═══ TRANSPORTE: Aprobar con decisión ═══ --}}
                        <div x-data="{
                            open: false,
                            decisionFinal: 'sistema',
                            comentario: '',
                            firma: null,
                            drawing: false, lastX: 0, lastY: 0,
                            getPos(e, c) {
                                const rect = c.getBoundingClientRect();
                                const src = e.touches ? e.touches[0] : e;
                                return { x: (src.clientX - rect.left) * (c.width / rect.width), y: (src.clientY - rect.top) * (c.height / rect.height) };
                            },
                            startDraw(e) { e.preventDefault(); const c = document.getElementById('firma-dec-{{ $row['id'] }}'); if (!c) return; this.drawing = true; const p = this.getPos(e, c); this.lastX = p.x; this.lastY = p.y; },
                            onDraw(e) { if (!this.drawing) return; e.preventDefault(); const c = document.getElementById('firma-dec-{{ $row['id'] }}'); if (!c) return; const ctx = c.getContext('2d'); const p = this.getPos(e, c); ctx.beginPath(); ctx.moveTo(this.lastX, this.lastY); ctx.lineTo(p.x, p.y); ctx.stroke(); this.lastX = p.x; this.lastY = p.y; },
                            stopDraw() { if (!this.drawing) return; this.drawing = false; const c = document.getElementById('firma-dec-{{ $row['id'] }}'); if (c) this.firma = c.toDataURL('image/png'); },
                            clearFirma() { const c = document.getElementById('firma-dec-{{ $row['id'] }}'); if (!c) return; c.getContext('2d').clearRect(0, 0, c.width, c.height); this.firma = null; },
                            confirmar() {
                                if (!this.comentario.trim()) return;
                                $wire.aprobarConDecision({{ $row['id'] }}, this.decisionFinal, this.comentario, this.firma);
                                this.open = false;
                            }
                        }">
                            <button class="btn-accion btn-success" @click="openModal(); open = true">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                Aprobar con decisión
                            </button>
                            <div x-show="open" x-transition.opacity class="fixed inset-0 z-40 bg-black/50" @click="open = false" style="display:none"></div>
                            <div x-show="open" x-transition class="fixed inset-0 z-50 flex items-center justify-center p-4" style="display:none">
                                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl p-6 space-y-4" @click.stop>
                                    <h2 class="text-base font-semibold text-gray-900 dark:text-white">
                                        Aprobar con decisión — <span class="font-mono text-gray-400 text-sm">{{ $row['codigo'] }}</span>
                                    </h2>
                                    <div><div class="modal-label">Decisión final <span class="text-red-400">*</span></div>
                                    <div class="flex gap-3 mt-1">
                                        <label class="flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium cursor-pointer transition-all"
                                            x-bind:class="decisionFinal === 'sistema' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 bg-white text-gray-600'">
                                            <input type="radio" value="sistema" x-model="decisionFinal" class="accent-indigo-600">
                                            Sugerencia del Sistema
                                        </label>
                                        <label class="flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium cursor-pointer transition-all"
                                            x-bind:class="decisionFinal === 'operativo' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 bg-white text-gray-600'">
                                            <input type="radio" value="operativo" x-model="decisionFinal" class="accent-amber-500">
                                            Asignación del Operativo
                                        </label>
                                    </div></div>
                                    <div><div class="modal-label">Comentario <span class="text-red-400">*</span></div>
                                    <textarea x-model="comentario" class="modal-textarea" rows="4" placeholder="Comentario de aprobación..."></textarea></div>
                                    <div><div class="modal-label">Firma del jefe <span class="text-gray-400 font-normal text-xs">(aparecerá en el PDF)</span></div>
                                    <div class="border border-gray-300 rounded-lg overflow-hidden bg-white" style="touch-action: none;">
                                        <canvas id="firma-dec-{{ $row['id'] }}" width="560" height="120" style="width:100%; height:120px; cursor:crosshair; display:block;"
                                            @mousedown="startDraw" @mousemove="onDraw" @mouseup="stopDraw" @mouseleave="stopDraw"
                                            @touchstart="startDraw" @touchmove="onDraw" @touchend="stopDraw"></canvas>
                                    </div>
                                    <button type="button" @click="clearFirma" class="mt-1 text-xs text-red-500 hover:text-red-700 underline">✕ Limpiar firma</button></div>
                                    <div class="flex justify-end gap-3 pt-2">
                                        <button type="button" class="btn-accion btn-gray" @click="open = false">Cancelar</button>
                                        <button type="button" class="btn-accion btn-success" @click="confirmar" x-bind:disabled="!comentario.trim()">
                                            Confirmar aprobación
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        @endif

                        @endif

                        {{-- ═══ TRANSPORTE: Desbloquear ═══ --}}
                        @if($row['tipo'] === 'transporte' && in_array($row['estado'], ['aprobada', 'asignada', 'en_ejecucion']))
                        <div x-data="{ open: false }">
                            <button class="btn-accion btn-gray" @click="open = true">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"/></svg>
                                Desbloquear
                            </button>
                            <div x-show="open" x-transition.opacity class="fixed inset-0 z-40 bg-black/50" @click="open = false" style="display:none"></div>
                            <div x-show="open" x-transition class="fixed inset-0 z-50 flex items-center justify-center p-4" style="display:none">
                                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 space-y-4" @click.stop>
                                    <h2 class="text-base font-semibold text-gray-900 dark:text-white">Desbloquear solicitud</h2>
                                    <p class="text-sm text-gray-500">Esta acción devolverá la solicitud a <strong>Pendiente</strong> y eliminará la asignación de recursos actual. ¿Confirmas?</p>
                                    <div class="flex justify-end gap-3 pt-2">
                                        <button type="button" class="btn-accion btn-gray" @click="open = false">Cancelar</button>
                                        <button type="button" class="btn-accion btn-danger" @click="$wire.desbloquearTransporte({{ $row['id'] }}); open = false">
                                            Sí, desbloquear
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        @endif

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