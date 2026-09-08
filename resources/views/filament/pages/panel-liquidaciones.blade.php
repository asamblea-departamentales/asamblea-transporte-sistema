<x-filament::page>


<style>
    .liq-filters {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        gap: 12px;
        margin-bottom: 24px;
    }
    .liq-filter-group label {
        display: block;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #6b7280;
        margin-bottom: 6px;
    }
    .liq-filter-group input,
    .liq-filter-group select {
        width: 100%;
        border: 1.5px solid #e5e7eb;
        border-radius: 10px;
        padding: 8px 12px;
        font-size: 13px;
        background: #fff;
        color: #111827;
        transition: border-color 0.15s;
        outline: none;
        box-sizing: border-box;
    }
    .liq-filter-group input:focus,
    .liq-filter-group select:focus {
        border-color: #6366f1;
        box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
    }
    .liq-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 12px;
        margin-bottom: 28px;
    }
    .liq-stat {
        background: #fff;
        border: 1.5px solid #f3f4f6;
        border-radius: 14px;
        padding: 16px 18px;
    }
    .liq-stat-label {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #9ca3af;
        margin-bottom: 6px;
    }
    .liq-stat-value {
        font-size: 22px;
        font-weight: 700;
        color: #111827;
        line-height: 1;
    }
    .liq-stat-sub {
        font-size: 11px;
        color: #9ca3af;
        margin-top: 4px;
    }
    .liq-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    .liq-card {
        background: #fff;
        border: 1.5px solid #f3f4f6;
        border-radius: 16px;
        padding: 16px 20px;
        display: flex;
        align-items: center;
        gap: 16px;
        transition: border-color 0.15s, box-shadow 0.15s;
    }
    .liq-card:hover {
        border-color: #e0e7ff;
        box-shadow: 0 4px 16px rgba(99,102,241,0.07);
    }
    .liq-card.liquidado { border-left: 3px solid #6366f1; }
    .liq-card.pendiente { border-left: 3px solid #f59e0b; }
    .liq-card.clickable { cursor: pointer; }
    .liq-tipo-badge {
        width: 40px;
        height: 40px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        flex-shrink: 0;
    }
    .liq-tipo-combustible   { background: #fef3c7; }
    .liq-tipo-mantenimiento { background: #dbeafe; }
    .liq-info { flex: 1; min-width: 0; }
    .liq-codigo {
        font-family: monospace;
        font-size: 13px;
        font-weight: 700;
        color: #111827;
        margin-bottom: 2px;
    }
    .liq-meta {
        font-size: 12px;
        color: #6b7280;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .liq-fecha {
        font-size: 11px;
        color: #9ca3af;
        margin-top: 2px;
    }
    .liq-monto-valor {
        font-size: 16px;
        font-weight: 700;
        color: #111827;
        flex-shrink: 0;
        text-align: right;
    }
    .liq-actions {
        display: flex;
        gap: 8px;
        flex-shrink: 0;
    }
    .liq-btn {
        padding: 7px 14px;
        border-radius: 9px;
        font-size: 12px;
        font-weight: 600;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        transition: opacity 0.15s, transform 0.1s;
        border: none;
        cursor: pointer;
    }
    .liq-btn:hover  { opacity: 0.88; transform: translateY(-1px); }
    .liq-btn:active { transform: scale(0.97); }
    .liq-btn-liquidar { background: #6366f1; color: #fff; }
    .liq-btn-pdf      { background: #f3f4f6; color: #374151; }
    .liq-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 8px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 600;
    }
    .liq-badge-liquidado { background: #ede9fe; color: #5b21b6; }
    .liq-badge-pendiente { background: #fef3c7; color: #92400e; }
    .liq-badge-comp-ok   { background: #dcfce7; color: #166534; }
    .liq-badge-comp-no   { background: #fee2e2; color: #991b1b; }
    .liq-empty {
        text-align: center;
        padding: 64px 0;
        color: #9ca3af;
    }
    .liq-empty-icon  { font-size: 48px; margin-bottom: 12px; }
    .liq-empty-title { font-size: 15px; font-weight: 600; color: #6b7280; }
    .liq-empty-sub   { font-size: 13px; margin-top: 4px; }
    .liq-top {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 10px;
    }
    .liq-top-title { font-size: 13px; font-weight: 600; color: #374151; }
    .liq-count     { font-size: 12px; color: #9ca3af; margin-left: auto; }
    .liq-clear {
        background: none;
        border: none;
        font-size: 12px;
        color: #9ca3af;
        cursor: pointer;
        text-decoration: underline;
        padding: 0;
    }
    .liq-clear:hover { color: #6b7280; }

    /* Toggle modo */
    .liq-toggle {
        display: inline-flex;
        background: #f3f4f6;
        border-radius: 12px;
        padding: 4px;
        gap: 4px;
    }
    .liq-toggle-btn {
        padding: 8px 16px;
        border-radius: 8px;
        border: none;
        background: transparent;
        font-size: 12px;
        font-weight: 600;
        color: #6b7280;
        cursor: pointer;
        transition: all 0.15s;
    }
    .liq-toggle-btn.active {
        background: #fff;
        color: #111827;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    .liq-toggle-btn:hover:not(.active) { color: #374151; }

    /* Dropdown acciones */
    .liq-dropdown {
        position: relative;
        display: inline-block;
    }
    .liq-dropdown-btn {
        padding: 7px 12px;
        border-radius: 9px;
        border: 1.5px solid #e5e7eb;
        background: #fff;
        font-size: 12px;
        font-weight: 600;
        color: #374151;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transition: all 0.15s;
    }
    .liq-dropdown-btn:hover { border-color: #d1d5db; background: #f9fafb; }
    .liq-dropdown-menu {
        position: absolute;
        right: 0;
        top: 100%;
        margin-top: 6px;
        background: #fff;
        border: 1.5px solid #e5e7eb;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.12);
        min-width: 180px;
        z-index: 20;
        overflow: hidden;
        display: none;
    }
    .liq-dropdown-menu.show { display: block; }
    .liq-dropdown-item {
        display: block;
        padding: 10px 14px;
        font-size: 13px;
        color: #374151;
        text-decoration: none;
        cursor: pointer;
        border: none;
        background: none;
        width: 100%;
        text-align: left;
        transition: background 0.1s;
    }
    .liq-dropdown-item:hover { background: #f9fafb; }
    .liq-dropdown-item.danger { color: #dc2626; }
    .liq-dropdown-item.disabled { color: #9ca3af; cursor: not-allowed; font-style: italic; }
    .liq-dropdown-divider {
        height: 1px;
        background: #f3f4f6;
        margin: 2px 0;
    }

    /* Badges por estado */
    .badge-borrador { background: #f3f4f6; color: #4b5563; }
    .badge-pendiente { background: #fef3c7; color: #92400e; }
    .badge-en_revision { background: #dbeafe; color: #1e40af; }
    .badge-pre_aprobada { background: #dbeafe; color: #1e40af; }
    .badge-aprobada { background: #dcfce7; color: #166534; }
    .badge-programada { background: #dbeafe; color: #1e40af; }
    .badge-asignada { background: #dbeafe; color: #1e40af; }
    .badge-en_ejecucion { background: #fef3c7; color: #92400e; }
    .badge-completada { background: #dcfce7; color: #166534; }
    .badge-rechazada { background: #fee2e2; color: #991b1b; }
    .badge-liquidada { background: #ede9fe; color: #5b21b6; }
    .badge-cancelada { background: #f3f4f6; color: #4b5563; }

    /* Transporte badge */
    .liq-tipo-transporte { background: #e0e7ff; }

    /* ── MODAL ── */
    .liq-modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.45);
        z-index: 50;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .liq-modal {
        background: #fff;
        border-radius: 20px;
        padding: 28px 32px;
        width: 100%;
        max-width: 440px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.15);
    }
    .liq-modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
    }
    .liq-modal-title {
        font-size: 16px;
        font-weight: 700;
        color: #111827;
        margin: 0;
    }
    .liq-modal-close {
        background: none;
        border: none;
        font-size: 22px;
        color: #9ca3af;
        cursor: pointer;
        line-height: 1;
        padding: 0;
    }
    .liq-modal-close:hover { color: #374151; }
    .liq-field { display: flex; flex-direction: column; gap: 5px; }
    .liq-field label {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #6b7280;
    }
    .liq-field input,
    .liq-field select,
    .liq-field textarea {
        width: 100%;
        border: 1.5px solid #e5e7eb;
        border-radius: 10px;
        padding: 9px 12px;
        font-size: 14px;
        outline: none;
        box-sizing: border-box;
        background: #fff;
        color: #111827;
        transition: border-color 0.15s;
    }
    .liq-field input:focus,
    .liq-field select:focus,
    .liq-field textarea:focus {
        border-color: #6366f1;
        box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
    }
    .liq-field textarea { resize: none; }
    .liq-field-error { font-size: 11px; color: #ef4444; }
    .liq-modal-footer {
        display: flex;
        gap: 10px;
        margin-top: 22px;
        justify-content: flex-end;
    }
    .liq-btn-cancel {
        padding: 9px 18px;
        border-radius: 10px;
        border: 1.5px solid #e5e7eb;
        background: #fff;
        font-size: 13px;
        font-weight: 600;
        color: #374151;
        cursor: pointer;
    }
    .liq-btn-confirm {
        padding: 9px 20px;
        border-radius: 10px;
        border: none;
        background: #6366f1;
        color: #fff;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: opacity 0.15s;
    }
    .liq-btn-confirm:hover { opacity: 0.88; }

    /* ── DRAWER ── */
    .liq-drawer-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.35);
        z-index: 40;
    }
    .liq-drawer {
        position: fixed;
        top: 0;
        right: 0;
        height: 100vh;
        width: 100%;
        max-width: 420px;
        background: #fff;
        z-index: 41;
        box-shadow: -8px 0 40px rgba(0,0,0,0.12);
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }
    .liq-drawer-header {
        padding: 20px 24px 16px;
        border-bottom: 1.5px solid #f3f4f6;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-shrink: 0;
    }
    .liq-drawer-title {
        font-size: 15px;
        font-weight: 700;
        color: #111827;
        margin: 0;
    }
    .liq-drawer-close {
        background: #f3f4f6;
        border: none;
        width: 32px;
        height: 32px;
        border-radius: 8px;
        font-size: 18px;
        color: #6b7280;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .liq-drawer-close:hover { background: #e5e7eb; color: #111827; }
    .liq-drawer-body {
        flex: 1;
        overflow-y: auto;
        padding: 20px 24px;
        display: flex;
        flex-direction: column;
        gap: 20px;
    }
    .liq-drawer-section-title {
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.07em;
        color: #9ca3af;
        margin-bottom: 10px;
    }
    .liq-drawer-row {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        padding: 6px 0;
        border-bottom: 1px solid #f9fafb;
    }
    .liq-drawer-row:last-child { border-bottom: none; }
    .liq-drawer-row-label { font-size: 12px; color: #6b7280; }
    .liq-drawer-row-value {
        font-size: 13px;
        font-weight: 600;
        color: #111827;
        text-align: right;
        max-width: 60%;
    }
    .liq-monto-box {
        flex: 1;
        background: #f9fafb;
        border-radius: 12px;
        padding: 14px 16px;
    }
    .liq-monto-box-label {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #9ca3af;
        margin-bottom: 4px;
    }
    .liq-monto-box-value {
        font-size: 20px;
        font-weight: 700;
        line-height: 1;
    }
    .liq-comp-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
    }
    .liq-comp-thumb {
        border-radius: 10px;
        overflow: hidden;
        border: 1.5px solid #f3f4f6;
        aspect-ratio: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f9fafb;
        text-decoration: none;
        transition: border-color 0.15s;
        flex-direction: column;
        gap: 4px;
    }
    .liq-comp-thumb:hover { border-color: #6366f1; }
    .liq-comp-thumb img { width: 100%; height: 100%; object-fit: cover; }
    .liq-comp-label {
        font-size: 10px;
        font-weight: 600;
        color: #6b7280;
    }
    .liq-drawer-footer {
        padding: 16px 24px;
        border-top: 1.5px solid #f3f4f6;
        flex-shrink: 0;
    }
</style>

{{-- TOGGLE DE MODO --}}
<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
    <div class="liq-toggle">
        <button class="liq-toggle-btn {{ $this->modo === 'liquidacion' ? 'active' : '' }}"
                wire:click="alternarModo">
            📊 Modo Liquidación
        </button>
        <button class="liq-toggle-btn {{ $this->modo === 'listado' ? 'active' : '' }}"
                wire:click="alternarModo">
            📋 Listado Completo
        </button>
    </div>
</div>

{{-- FILTROS --}}
<div class="liq-filters">
    <div class="liq-filter-group">
        <label>Desde</label>
        <input type="date" wire:model.live="fecha_desde">
    </div>
    <div class="liq-filter-group">
        <label>Hasta</label>
        <input type="date" wire:model.live="fecha_hasta">
    </div>
    <div class="liq-filter-group">
        <label>Tipo</label>
        <select wire:model.live="tipo">
            <option value="">Todos</option>
            <option value="transporte">🚗 Transporte (solo consulta)</option>
            <option value="combustible">⛽ Combustible</option>
            <option value="mantenimiento">🔧 Mantenimiento</option>
        </select>
    </div>
    <div class="liq-filter-group">
        <label>Estado</label>
        <select wire:model.live="estado">
            <option value="">Todos</option>
            @foreach($this->getEstadoOptions() as $option)
                <option value="{{ $option['value'] }}">
                    {{ $option['label'] }}
                </option>
            @endforeach
        </select>
    </div>
    <div class="liq-filter-group">
        <label>Solicitante</label>
        <select wire:model.live="solicitante_id">
            <option value="">Todos</option>
            @foreach($this->getSolicitantes() as $id => $name)
                <option value="{{ $id }}">{{ $name }}</option>
            @endforeach
        </select>
    </div>
    <div class="liq-filter-group">
        <label>Motorista</label>
        <select wire:model.live="motorista_id">
            <option value="">Todos</option>
            @foreach($this->getMotoristas() as $id => $nombre)
                <option value="{{ $id }}">{{ $nombre }}</option>
            @endforeach
        </select>
    </div>
</div>

{{-- KPIs --}}
@php
    $items      = $this->getData();
    $total      = $items->count();
    $pendientes = $items->filter(fn($i) => !$i['liquidado'])->count();
    $liquidados = $items->filter(fn($i) =>  $i['liquidado'])->count();
    $montoTotal = $items->sum('monto');
    $sinComp    = $items->filter(fn($i) => !$i['tiene_comprobantes'])->count();
@endphp

<div class="liq-stats">
    <div class="liq-stat">
        <div class="liq-stat-label">Total</div>
        <div class="liq-stat-value">{{ $total }}</div>
        <div class="liq-stat-sub">solicitudes</div>
    </div>
    <div class="liq-stat">
        <div class="liq-stat-label">Pendientes</div>
        <div class="liq-stat-value" style="color:#d97706">{{ $pendientes }}</div>
        <div class="liq-stat-sub">por liquidar</div>
    </div>
    <div class="liq-stat">
        <div class="liq-stat-label">Liquidadas</div>
        <div class="liq-stat-value" style="color:#6366f1">{{ $liquidados }}</div>
        <div class="liq-stat-sub">completadas</div>
    </div>
    <div class="liq-stat">
        <div class="liq-stat-label">Monto total</div>
        <div class="liq-stat-value" style="font-size:18px">${{ number_format($montoTotal, 2) }}</div>
        <div class="liq-stat-sub">en el periodo</div>
    </div>
    @if($sinComp > 0)
    <div class="liq-stat" style="border-color:#fee2e2;background:#fffafa;">
        <div class="liq-stat-label" style="color:#ef4444;">Sin comp.</div>
        <div class="liq-stat-value" style="color:#ef4444;">{{ $sinComp }}</div>
        <div class="liq-stat-sub" style="color:#ef4444;">sin comprobantes</div>
    </div>
    @endif
</div>

{{-- HEADER LISTA --}}
<div class="liq-top">
    <span class="liq-top-title">Solicitudes</span>
    <span class="liq-count">{{ $total }} resultado(s)</span>
    <button class="liq-clear" wire:click="limpiarFiltros">Limpiar filtros</button>
</div>

{{-- LISTA --}}
<div class="liq-list">
    @forelse($items as $item)
        @php
            $estadoValor = $item['estado_raw'] ?? 'pendiente';
            $estadoLabel = $item['estado'] ?? ucfirst($estadoValor);
            $estadoBadgeClass = 'badge-' . strtolower($estadoValor);

            // Determinar si se puede editar (BORRADOR o PENDIENTE)
            $puedeEditar = $item['puede_editar'] ?? in_array($estadoValor, ['borrador', 'pendiente']);

            // Determinar si es transporte
            $esTransporte = $item['tipo'] === 'transporte';

            // Datos mínimos para generar PDFs de transporte
            $transporteCompleto = $esTransporte && !empty($item['vehiculo']) && !empty($item['motorista']);

            // Rutas de edición utilizando el método nativo de Filament
            $rutaEditar = match($item['tipo']) {
                'transporte' => \App\Filament\Resources\SolicitudTransporteResource::getUrl('edit', ['record' => $item['id']]),
                'combustible' => \App\Filament\Resources\SolicitudCombustibleResource::getUrl('edit', ['record' => $item['id']]),
                'mantenimiento' => \App\Filament\Resources\SolicitudMantenimientoResource::getUrl('edit', ['record' => $item['id']]),
                default => '#',
            };

            // Rutas de vista detalle
            // Rutas de visualización utilizando el método nativo de Filament
            $rutaVer = match($item['tipo']) {
                'transporte' => \App\Filament\Resources\SolicitudTransporteResource::getUrl('view', ['record' => $item['id']]),
                'combustible' => \App\Filament\Resources\SolicitudCombustibleResource::getUrl('view', ['record' => $item['id']]),
                'mantenimiento' => \App\Filament\Resources\SolicitudMantenimientoResource::getUrl('view', ['record' => $item['id']]),
                default => '#',
            };
        @endphp
        <div class="liq-card {{ $item['liquidado'] ? 'liquidado' : 'pendiente' }}"
             x-data="{ 
                id: {{ $item['id'] }}, 
                tipo: '{{ $item['tipo'] }}',
                showDropdown: false 
            }"
             @click.outside="showDropdown = false"
             style="cursor:pointer;">

            <div class="liq-tipo-badge 
                {{ $item['tipo'] === 'combustible' ? 'liq-tipo-combustible' : '' }}
                {{ $item['tipo'] === 'mantenimiento' ? 'liq-tipo-mantenimiento' : '' }}
                {{ $esTransporte ? 'liq-tipo-transporte' : '' }}">
                {{ $item['tipo'] === 'combustible' ? '⛽' : '' }}
                {{ $item['tipo'] === 'mantenimiento' ? '🔧' : '' }}
                {{ $esTransporte ? '🚗' : '' }}
            </div>

            <div class="liq-info" @click="!showDropdown && $wire.abrirDetalle(id, tipo)">
                <div class="liq-codigo">
                    {{ $item['codigo'] }}
                    @if($esTransporte)
                        <span style="font-size:10px;color:#6366f1;margin-left:6px;">(solo consulta)</span>
                    @endif
                </div>
                <div class="liq-meta">
                    {{ $item['vehiculo'] ?? '—' }} &middot; {{ $item['solicitante'] ?? '—' }}
                    @if(!empty($item['motorista']))
                        &middot; 🚕 {{ $item['motorista'] }}
                    @endif
                </div>
                <div class="liq-fecha">
                    {{ $item['fecha'] ? \Carbon\Carbon::parse($item['fecha'])->format('d/m/Y') : '—' }}
                </div>
            </div>

            <div style="display:flex;flex-direction:column;gap:5px;align-items:flex-end;flex-shrink:0;">
                <span class="liq-badge {{ $estadoBadgeClass }}">{{ $estadoLabel }}</span>
                @if($item['tiene_comprobantes'])
                    <span class="liq-badge liq-badge-comp-ok">📎 Con comp.</span>
                @else
                    <span class="liq-badge liq-badge-comp-no">✖ Sin comp.</span>
                @endif
            </div>

            <div class="liq-monto-valor">
                @if($item['monto'] > 0)
                    ${{ number_format($item['monto'], 2) }}
                @else
                    <span style="color:#9ca3af;">—</span>
                @endif
            </div>

            <div class="liq-actions" @click.stop>
                {{-- DROPDOWN DE ACCIONES --}}
                <div class="liq-dropdown" x-data>
                    <button class="liq-dropdown-btn" @click="showDropdown = !showDropdown">
                        ⋮ Acciones
                    </button>
                    <div class="liq-dropdown-menu" :class="{ 'show': showDropdown }">
                        {{-- Ver detalle (drawer interno del panel) --}}
                        <button wire:click="abrirDetalle({{ $item['id'] }}, '{{ $item['tipo'] }}')" class="liq-dropdown-item">
                            👁️ Ver detalle
                        </button>

                        {{-- Misión Oficial (Transporte) --}}
                        @if($esTransporte && !empty($item['vehiculo']) && !empty($item['motorista']))
                            <div class="liq-dropdown-divider"></div>
                            @if(in_array($item['estado_raw'], ['aprobada', 'programada', 'asignada', 'completada']))
                            <a href="{{ route('reportes.mision-oficial.pdf', $item['id']) }}"
                               target="_blank" class="liq-dropdown-item">
                                📄 Misión Oficial
                            </a>
                            @else
                            <span class="liq-dropdown-item disabled" title="Para generar la Misión Oficial la solicitud debe estar aprobada, programada o asignada.">
                                📄 Misión Oficial (requiere aprobación)
                            </span>
                            @endif
                        @endif

                        @if($item['tipo'] === 'combustible' && !empty($item['solicitud_transporte_id']))
                            <div class="liq-dropdown-divider"></div>
                            <a href="{{ route('reportes.solicitud-autorizacion.pdf', [$item['solicitud_transporte_id'], $item['id']]) }}" 
                               target="_blank" class="liq-dropdown-item">
                                📄 Documento Oficial
                            </a>
                        @endif

                        @if($item['tipo'] === 'mantenimiento')
                            <div class="liq-dropdown-divider"></div>
                            @if(in_array($item['estado_raw'], ['aprobada', 'en_ejecucion', 'completada']))
                            <a href="{{ route('reportes.orden-trabajo.pdf', $item['id']) }}"
                               target="_blank" class="liq-dropdown-item">
                                🔧 Orden de Trabajo
                            </a>
                            @else
                            <span class="liq-dropdown-item disabled" title="Para generar la orden de trabajo la solicitud debe estar aprobada, en ejecución o completada.">
                                🔧 Orden de Trabajo (requiere aprobación)
                            </span>
                            @endif
                        @endif

                        @if(!$esTransporte && $item['liquidado'])
                            <div class="liq-dropdown-divider"></div>
                            <a href="{{ $item['tipo'] === 'combustible'
                                ? route('liquidacion.combustible.pdf', $item['id'])
                                : route('liquidacion.mantenimiento.pdf', $item['id']) }}"
                               target="_blank" class="liq-dropdown-item">
                                📊 PDF Liquidación
                            </a>
                        @endif

                        {{-- Liquidar (solo si no es transporte, no liquidado, y tiene comprobantes) --}}
                        @if(!$esTransporte && !$item['liquidado'] && $item['tiene_comprobantes'])
                            <div class="liq-dropdown-divider"></div>
                            <button 
                                wire:click="abrirModalLiquidar({{ $item['id'] }}, '{{ $item['tipo'] }}')"
                                class="liq-dropdown-item"
                                style="color:#6366f1;font-weight:600;">
                                💰 Liquidar
                            </button>
                        @endif

                        {{-- Incidencia (solo si no es transporte) --}}
                        @if(!$esTransporte)
                            <div class="liq-dropdown-divider"></div>
                            <button
                                wire:click="abrirModalIncidencia({{ $item['id'] }}, '{{ $item['tipo'] }}')"
                                class="liq-dropdown-item danger">
                                ⚠ Incidencia
                            </button>
                        @endif
                    </div>
                </div>
            </div>

        </div>
    @empty
        <div class="liq-empty">
            <div class="liq-empty-icon">📋</div>
            <div class="liq-empty-title">Sin resultados</div>
            <div class="liq-empty-sub">Ajusta los filtros o el rango de fechas</div>
        </div>
    @endforelse
</div>

{{-- MODAL LIQUIDAR --}}
@if($this->modalLiquidar)
<div class="liq-modal-overlay" wire:click.self="cerrarModal">
    <div class="liq-modal" style="max-width:620px;">
        <div class="liq-modal-header">
            <h3 class="liq-modal-title">
                Liquidar {{ $this->liquidarData['codigo'] ?? '' }}
                &middot;
                {{ $this->liquidarTipo === 'combustible' ? '⛽ Combustible' : '🔧 Mantenimiento' }}
            </h3>
            <button class="liq-modal-close" wire:click="cerrarModal">&times;</button>
        </div>

        <div style="display:flex;flex-direction:column;gap:16px;">

            {{-- Montos lado a lado --}}
            <div style="display:flex;gap:12px;">
                <div class="liq-monto-box" style="flex:1;">
                    <div class="liq-monto-box-label">Monto solicitado</div>
                    <div class="liq-monto-box-value" style="color:#111827;font-size:18px;">
                        ${{ number_format($this->liquidarData['monto_solicitado'] ?? 0, 2) }}
                    </div>
                    @if($this->liquidarTipo === 'combustible')
                        <div style="font-size:11px;color:#9ca3af;margin-top:4px;">
                            {{ number_format($this->liquidarData['cantidad'], 2) }} cargas
                        </div>
                        <div style="font-size:11px;color:#9ca3af;margin-top:2px;">
                            Ticket: {{ $this->liquidarData['ticket'] ?? '—' }}
                        </div>
                    @endif
                </div>
                <div class="liq-field" style="flex:1;">
                    <label>Monto validado</label>
                    <input type="number" step="0.01" wire:model="monto_validado" placeholder="0.00">
                    @error('monto_validado')
                        <span class="liq-field-error">{{ $message }}</span>
                    @enderror
                </div>
            </div>

            {{-- Comprobantes preview --}}
            @if(!empty($this->liquidarData['comprobantes']))
            <div>
                <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#9ca3af;margin-bottom:8px;">
                    Comprobantes
                </div>
                <div class="liq-comp-grid" style="grid-template-columns:repeat(4, 1fr);">
                    @foreach($this->liquidarData['comprobantes'] as $path)
                        @php
                            $url   = asset('storage/' . $path);
                            $ext   = strtolower(pathinfo($path, PATHINFO_EXTENSION));
                            $isImg = in_array($ext, ['jpg','jpeg','png','webp','gif']);
                        @endphp
                        <a href="{{ $url }}" target="_blank" class="liq-comp-thumb">
                            @if($isImg)
                                <img src="{{ $url }}" alt="Comprobante">
                            @else
                                <span style="font-size:24px;">📄</span>
                                <span class="liq-comp-label">{{ strtoupper($ext) }}</span>
                            @endif
                        </a>
                    @endforeach
                </div>
            </div>
            @endif

            {{-- Formulario --}}
            <div class="liq-field">
                <label>Resultado</label>
                <select wire:model="resultado">
                    <option value="">Seleccionar...</option>
                    <option value="coincide">✔ Coincide</option>
                    <option value="discrepancia">✖ Discrepancia</option>
                </select>
                @error('resultado')
                    <span class="liq-field-error">{{ $message }}</span>
                @enderror
            </div>
            <div class="liq-field">
                <label>Observaciones</label>
                <textarea wire:model="observaciones" rows="3" placeholder="Notas contables opcionales..."></textarea>
            </div>
        </div>

        <div class="liq-modal-footer">
            <button class="liq-btn-cancel" wire:click="cerrarModal">Cancelar</button>
            <button class="liq-btn-confirm" wire:click="confirmarLiquidacion">Confirmar Liquidación</button>
        </div>
    </div>
</div>
@endif
{{-- MODAL INCIDENCIAS --}}
@if($this->modalIncidencia)
<div class="liq-modal-overlay" wire:click.self="cerrarModalIncidencia">
    <div class="liq-modal">

        <div class="liq-modal-header">
            <h3 class="liq-modal-title">Reportar Incidencia</h3>
            <button class="liq-modal-close" wire:click="cerrarModalIncidencia">&times;</button>
        </div>

        <div style="display:flex;flex-direction:column;gap:14px;">

            <div class="liq-field">
                <label>Tipo</label>
                <input type="text" wire:model="tipo_incidencia" placeholder="Ej: Daño mecánico">
                @error('tipo_incidencia')
                    <span class="liq-field-error">{{ $message }}</span>
                @enderror
            </div>

            <div class="liq-field">
                <label>Severidad</label>
                <select wire:model="severidad">
                    <option value="">Seleccionar...</option>
                    <option value="baja">🟢 Baja</option>
                    <option value="media">🟡 Media</option>
                    <option value="alta">🟠 Alta</option>
                    <option value="critica">🔴 Crítica</option>
                </select>
                @error('severidad')
                    <span class="liq-field-error">{{ $message }}</span>
                @enderror
            </div>

            <div class="liq-field">
                <label>Descripción</label>
                <textarea wire:model="descripcion" rows="4" placeholder="Describe lo ocurrido..."></textarea>
                @error('descripcion')
                    <span class="liq-field-error">{{ $message }}</span>
                @enderror
            </div>

        </div>

        <div class="liq-modal-footer">
            <button class="liq-btn-cancel" wire:click="cerrarModalIncidencia">Cancelar</button>
            <button class="liq-btn-confirm" wire:click="guardarIncidencia">
                Registrar Incidencia
            </button>
        </div>

    </div>
</div>
@endif

{{-- DRAWER DETALLE --}}
@if($this->drawerDetalle && $this->detalleItem)
<div class="liq-drawer-overlay" wire:click="cerrarDetalle"></div>
<div class="liq-drawer">

    <div class="liq-drawer-header">
        <div>
            <div style="font-size:11px;color:#9ca3af;margin-bottom:2px;">
                {{ $this->detalleItem['tipo'] === 'combustible' ? '⛽ Combustible' : '' }}
                {{ $this->detalleItem['tipo'] === 'mantenimiento' ? '🔧 Mantenimiento' : '' }}
                {{ $this->detalleItem['tipo'] === 'transporte' ? '🚗 Transporte' : '' }}
                &middot; {{ $this->modo === 'liquidacion' ? 'Resumen Financiero' : 'Detalle de solicitud' }}
            </div>
            <h3 class="liq-drawer-title">{{ $this->detalleItem['codigo'] }}</h3>
        </div>
        <button class="liq-drawer-close" wire:click="cerrarDetalle">&times;</button>
    </div>

    <div class="liq-drawer-body">

        @if($this->modo === 'liquidacion')
            {{-- ═══ MODO LIQUIDACIÓN: solo datos financieros ═══ --}}
            @if(in_array($this->detalleItem['tipo'], ['combustible', 'mantenimiento']))

                {{-- Datos de Liquidación --}}
                <div>
                    <div class="liq-drawer-section-title">Datos de Liquidación</div>
                    @if($this->detalleItem['tipo'] === 'combustible')
                    <div class="liq-drawer-row">
                        <span class="liq-drawer-row-label">Contrato</span>
                        <span class="liq-drawer-row-value">{{ $this->detalleItem['contrato_numero'] ?? '—' }}</span>
                    </div>
                    <div class="liq-drawer-row">
                        <span class="liq-drawer-row-label">Serie</span>
                        <span class="liq-drawer-row-value">{{ $this->detalleItem['serie_nombre'] ?? '—' }}</span>
                    </div>
                    <div class="liq-drawer-row">
                        <span class="liq-drawer-row-label">Correlativo</span>
                        <span class="liq-drawer-row-value">{{ $this->detalleItem['correlativo_rango'] ?? '—' }}</span>
                    </div>
                    <div class="liq-drawer-row">
                        <span class="liq-drawer-row-label">Cant. vales</span>
                        <span class="liq-drawer-row-value">{{ $this->detalleItem['cantidad_vales'] ?? '—' }}</span>
                    </div>
                    @else
                    <div class="liq-drawer-row">
                        <span class="liq-drawer-row-label">Contrato</span>
                        <span class="liq-drawer-row-value">{{ $this->detalleItem['contrato_numero'] ?? '—' }}</span>
                    </div>
                    @endif
                </div>

                {{-- Resumen Financiero --}}
                <div>
                    <div class="liq-drawer-section-title">Resumen Financiero</div>
                    <div style="display:flex;gap:10px;margin-bottom:10px;">
                        <div class="liq-monto-box">
                            <div class="liq-monto-box-label">Monto solicitado</div>
                            <div class="liq-monto-box-value" style="color:#111827;">
                                ${{ number_format($this->detalleItem['monto_solicitado'] ?? 0, 2) }}
                            </div>
                        </div>
                        @if($this->detalleItem['liquidado'])
                        <div class="liq-monto-box">
                            <div class="liq-monto-box-label">Validado</div>
                            <div class="liq-monto-box-value"
                                 style="color:{{ ($this->detalleItem['monto_validado'] ?? 0) < ($this->detalleItem['monto_solicitado'] ?? 0) ? '#ef4444' : '#10b981' }}">
                                ${{ number_format($this->detalleItem['monto_validado'] ?? 0, 2) }}
                            </div>
                        </div>
                        @endif
                    </div>

                    @if($this->detalleItem['liquidado'])
                        @php
                            $diff = ($this->detalleItem['monto_validado'] ?? 0) - ($this->detalleItem['monto_solicitado'] ?? 0);
                        @endphp
                        <div style="padding:10px 14px;border-radius:10px;background:{{ $diff < 0 ? '#fef2f2' : '#f0fdf4' }};display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                            <span style="font-size:12px;color:{{ $diff < 0 ? '#991b1b' : '#166534' }};font-weight:600;">
                                {{ $diff < 0 ? 'Diferencia' : 'Remanente' }}
                            </span>
                            <span style="font-size:14px;font-weight:700;color:{{ $diff < 0 ? '#dc2626' : '#16a34a' }};">
                                {{ $diff > 0 ? '+' : '' }}${{ number_format($diff, 2) }}
                            </span>
                        </div>

                        <div style="display:flex;align-items:center;justify-content:space-between;">
                            <span style="font-size:12px;color:#6b7280;">Resultado</span>
                            @if($this->detalleItem['resultado'] === 'coincide')
                                <span class="liq-badge liq-badge-comp-ok">✔ Coincide</span>
                            @elseif($this->detalleItem['resultado'] === 'discrepancia')
                                <span class="liq-badge liq-badge-comp-no">✖ Discrepancia</span>
                            @else
                                <span class="liq-badge liq-badge-pendiente">— Sin resultado</span>
                            @endif
                        </div>

                        @if($this->detalleItem['observaciones'])
                        <div style="margin-top:12px;">
                            <div style="font-size:11px;color:#6b7280;font-weight:500;margin-bottom:4px;">Observaciones</div>
                            <div style="background:#f9fafb;border-radius:10px;padding:12px 14px;font-size:13px;color:#374151;line-height:1.6;">
                                {{ $this->detalleItem['observaciones'] }}
                            </div>
                        </div>
                        @endif
                    @endif
                </div>

                {{-- Comprobantes --}}
                <div>
                    <div class="liq-drawer-section-title">Comprobantes</div>
                    @if(empty($this->detalleItem['comprobantes']))
                        <div style="text-align:center;padding:24px;background:#f9fafb;border-radius:10px;color:#9ca3af;font-size:13px;">
                            Sin comprobantes adjuntos
                        </div>
                    @else
                        <div class="liq-comp-grid">
                            @foreach($this->detalleItem['comprobantes'] as $path)
                                @php
                                    $url   = asset('storage/' . $path);
                                    $ext   = strtolower(pathinfo($path, PATHINFO_EXTENSION));
                                    $isImg = in_array($ext, ['jpg','jpeg','png','webp','gif']);
                                @endphp
                                <a href="{{ $url }}" target="_blank" class="liq-comp-thumb">
                                    @if($isImg)
                                        <img src="{{ $url }}" alt="Comprobante">
                                    @else
                                        <span style="font-size:24px;">📄</span>
                                        <span class="liq-comp-label">{{ strtoupper($ext) }}</span>
                                    @endif
                                </a>
                            @endforeach
                        </div>
                    @endif
                </div>

            @else
                {{-- Transporte en modo liquidación no aplica --}}
                <div style="text-align:center;padding:48px 0;">
                    <div style="font-size:48px;margin-bottom:12px;">🚗</div>
                    <div style="font-size:15px;font-weight:600;color:#6b7280;">Solo consulta</div>
                    <div style="font-size:13px;color:#9ca3af;margin-top:4px;">
                        Las solicitudes de transporte no se liquidan financieramente.
                    </div>
                    @if($this->detalleItem['tiene_mision_oficial'] || $this->detalleItem['tiene_doc_oficial'])
                        <div style="margin-top:16px;display:flex;gap:8px;justify-content:center;">
                            @if($this->detalleItem['tiene_mision_oficial'])
                                <a href="{{ $this->detalleItem['mision_oficial_route'] }}" target="_blank" class="liq-btn liq-btn-pdf">
                                    📄 Misión Oficial
                                </a>
                            @endif
                            @if($this->detalleItem['tiene_doc_oficial'])
                                <a href="{{ $this->detalleItem['doc_oficial_route'] }}" target="_blank" class="liq-btn liq-btn-pdf">
                                    📄 Documento Oficial
                                </a>
                            @endif
                        </div>
                    @endif
                </div>
            @endif

        @else
            {{-- ═══ MODO LISTADO: detalle completo ═══ --}}

            {{-- Info general --}}
            <div>
                <div class="liq-drawer-section-title">Información general</div>
                <div class="liq-drawer-row">
                    <span class="liq-drawer-row-label">Vehículo</span>
                    <span class="liq-drawer-row-value">{{ $this->detalleItem['vehiculo'] ?? '—' }}</span>
                </div>
                <div class="liq-drawer-row">
                    <span class="liq-drawer-row-label">Solicitante</span>
                    <span class="liq-drawer-row-value">{{ $this->detalleItem['solicitante'] ?? '—' }}</span>
                </div>
                @if($this->detalleItem['tipo'] !== 'mantenimiento')
                <div class="liq-drawer-row">
                    <span class="liq-drawer-row-label">Motorista</span>
                    <span class="liq-drawer-row-value">{{ $this->detalleItem['motorista'] ?? '—' }}</span>
                </div>
                @endif
                <div class="liq-drawer-row">
                    <span class="liq-drawer-row-label">Fecha</span>
                    <span class="liq-drawer-row-value">{{ $this->detalleItem['fecha'] ?? '—' }}</span>
                </div>
                @if(!empty($this->detalleItem['destino']) && $this->detalleItem['destino'] !== '—')
                <div class="liq-drawer-row">
                    <span class="liq-drawer-row-label">Destino / Actividad</span>
                    <span class="liq-drawer-row-value">{{ $this->detalleItem['destino'] }}</span>
                </div>
                @endif
                @if(!empty($this->detalleItem['estado']))
                <div class="liq-drawer-row">
                    <span class="liq-drawer-row-label">Estado</span>
                    <span class="liq-drawer-row-value" style="text-transform:uppercase;">{{ $this->detalleItem['estado'] }}</span>
                </div>
                @endif
            </div>

            {{-- Detalle por tipo --}}
            @if($this->detalleItem['tipo'] === 'combustible')
            <div>
                <div class="liq-drawer-section-title">Detalle de Combustible</div>
                <div class="liq-drawer-row">
                    <span class="liq-drawer-row-label">Contrato</span>
                    <span class="liq-drawer-row-value">{{ $this->detalleItem['contrato_numero'] ?? '—' }}</span>
                </div>
                <div class="liq-drawer-row">
                    <span class="liq-drawer-row-label">Serie</span>
                    <span class="liq-drawer-row-value">{{ $this->detalleItem['serie_nombre'] ?? '—' }}</span>
                </div>
                <div class="liq-drawer-row">
                    <span class="liq-drawer-row-label">Correlativo</span>
                    <span class="liq-drawer-row-value">{{ $this->detalleItem['correlativo_rango'] ?? '—' }}</span>
                </div>
                <div class="liq-drawer-row">
                    <span class="liq-drawer-row-label">Cargas</span>
                    <span class="liq-drawer-row-value">{{ number_format($this->detalleItem['cantidad_galones'] ?? 0, 2) }} cargas</span>
                </div>
                <div class="liq-drawer-row">
                    <span class="liq-drawer-row-label">Cant. vales</span>
                    <span class="liq-drawer-row-value">{{ $this->detalleItem['cantidad_vales'] ?? '—' }}</span>
                </div>
                <div class="liq-drawer-row">
                    <span class="liq-drawer-row-label">Precio</span>
                    <span class="liq-drawer-row-value">${{ number_format($this->detalleItem['valor_unitario'] ?? 1, 2) }}</span>
                </div>
                <div class="liq-drawer-row">
                    <span class="liq-drawer-row-label">Ticket</span>
                    <span class="liq-drawer-row-value">{{ $this->detalleItem['ticket'] ?? '—' }}</span>
                </div>
                <div class="liq-drawer-row">
                    <span class="liq-drawer-row-label">N° Vale/Ticket</span>
                    <span class="liq-drawer-row-value">{{ $this->detalleItem['numero_vale_ticket'] ?? '—' }}</span>
                </div>
                @if(!empty($this->detalleItem['fecha_asignacion']))
                <div class="liq-drawer-row">
                    <span class="liq-drawer-row-label">Fecha asignación</span>
                    <span class="liq-drawer-row-value">{{ $this->detalleItem['fecha_asignacion'] }}</span>
                </div>
                @endif
            </div>
            @endif

            @if($this->detalleItem['tipo'] === 'mantenimiento')
            <div>
                <div class="liq-drawer-section-title">Detalle de Mantenimiento</div>
                <div class="liq-drawer-row">
                    <span class="liq-drawer-row-label">Tipo</span>
                    <span class="liq-drawer-row-value">{{ $this->detalleItem['tipo_mantenimiento'] ?? '—' }}</span>
                </div>
                <div class="liq-drawer-row">
                    <span class="liq-drawer-row-label">Contrato</span>
                    <span class="liq-drawer-row-value">{{ $this->detalleItem['contrato_numero'] ?? '—' }}</span>
                </div>
                <div class="liq-drawer-row">
                    <span class="liq-drawer-row-label">Detalle</span>
                    <span class="liq-drawer-row-value" style="max-width:70%;text-align:right;">{{ $this->detalleItem['detalle'] ?? '—' }}</span>
                </div>
                <div class="liq-drawer-row">
                    <span class="liq-drawer-row-label">Fecha sugerida</span>
                    <span class="liq-drawer-row-value">{{ $this->detalleItem['fecha_sugerida'] ?? '—' }}</span>
                </div>
                <div class="liq-drawer-row">
                    <span class="liq-drawer-row-label">Fecha realizada</span>
                    <span class="liq-drawer-row-value">{{ $this->detalleItem['fecha_realizada'] ?? '—' }}</span>
                </div>
                <div class="liq-drawer-row">
                    <span class="liq-drawer-row-label">Costo estimado</span>
                    <span class="liq-drawer-row-value">${{ number_format($this->detalleItem['costo_estimado'] ?? 0, 2) }}</span>
                </div>
                @if($this->detalleItem['costo_real'])
                <div class="liq-drawer-row">
                    <span class="liq-drawer-row-label">Costo real</span>
                    <span class="liq-drawer-row-value">${{ number_format($this->detalleItem['costo_real'], 2) }}</span>
                </div>
                @endif
            </div>
            @endif

            @if($this->detalleItem['tipo'] === 'transporte')
            <div>
                <div class="liq-drawer-section-title">Detalle de Transporte</div>
                <div class="liq-drawer-row">
                    <span class="liq-drawer-row-label">Motivo / Actividad</span>
                    <span class="liq-drawer-row-value" style="max-width:70%;text-align:right;">{{ $this->detalleItem['motivo_actividad'] ?? '—' }}</span>
                </div>
                <div class="liq-drawer-row">
                    <span class="liq-drawer-row-label">Destino</span>
                    <span class="liq-drawer-row-value">{{ $this->detalleItem['destino'] ?? '—' }}</span>
                </div>
                <div class="liq-drawer-row">
                    <span class="liq-drawer-row-label">Fecha salida</span>
                    <span class="liq-drawer-row-value">{{ $this->detalleItem['fecha_salida'] ?? '—' }}</span>
                </div>
                <div class="liq-drawer-row">
                    <span class="liq-drawer-row-label">Fecha retorno</span>
                    <span class="liq-drawer-row-value">{{ $this->detalleItem['fecha_retorno'] ?? '—' }}</span>
                </div>
                <div class="liq-drawer-row">
                    <span class="liq-drawer-row-label">Personas</span>
                    <span class="liq-drawer-row-value">{{ $this->detalleItem['cantidad_personas'] ?? '—' }}</span>
                </div>
                <div class="liq-drawer-row">
                    <span class="liq-drawer-row-label">Prioridad</span>
                    <span class="liq-drawer-row-value">{{ ucfirst($this->detalleItem['prioridad_grupo'] instanceof \UnitEnum ? $this->detalleItem['prioridad_grupo']->value : ($this->detalleItem['prioridad_grupo'] ?? '—')) }}</span>
                </div>
                @if($this->detalleItem['comentario_jefe'] && $this->detalleItem['comentario_jefe'] !== '—')
                <div class="liq-drawer-row">
                    <span class="liq-drawer-row-label">Comentario jefe</span>
                    <span class="liq-drawer-row-value" style="max-width:60%;text-align:right;">{{ $this->detalleItem['comentario_jefe'] }}</span>
                </div>
                @endif
            </div>
            @endif

            {{-- Resumen Financiero (modo listado) --}}
            @if($this->detalleItem['tipo'] !== 'transporte')
            <div>
                <div class="liq-drawer-section-title">Resumen Financiero</div>
                <div style="display:flex;gap:10px;margin-bottom:10px;">
                    <div class="liq-monto-box">
                        <div class="liq-monto-box-label">
                            {{ $this->detalleItem['tipo'] === 'combustible' ? 'Valor solicitado' : 'Costo' }}
                        </div>
                        <div class="liq-monto-box-value" style="color:#111827;">
                            ${{ number_format($this->detalleItem['monto_solicitado'] ?? 0, 2) }}
                        </div>
                    </div>
                    @if($this->detalleItem['liquidado'])
                    <div class="liq-monto-box">
                        <div class="liq-monto-box-label">Validado</div>
                        <div class="liq-monto-box-value"
                             style="color:{{ ($this->detalleItem['monto_validado'] ?? 0) < ($this->detalleItem['monto_solicitado'] ?? 0) ? '#ef4444' : '#10b981' }}">
                            ${{ number_format($this->detalleItem['monto_validado'] ?? 0, 2) }}
                        </div>
                    </div>
                    @endif
                </div>

                @if($this->detalleItem['liquidado'])
                    @php
                        $diff = ($this->detalleItem['monto_validado'] ?? 0) - ($this->detalleItem['monto_solicitado'] ?? 0);
                    @endphp
                    <div style="padding:10px 14px;border-radius:10px;background:{{ $diff < 0 ? '#fef2f2' : '#f0fdf4' }};display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                        <span style="font-size:12px;color:{{ $diff < 0 ? '#991b1b' : '#166534' }};font-weight:600;">
                            {{ $diff < 0 ? 'Diferencia' : 'Remanente' }}
                        </span>
                        <span style="font-size:14px;font-weight:700;color:{{ $diff < 0 ? '#dc2626' : '#16a34a' }};">
                            {{ $diff > 0 ? '+' : '' }}${{ number_format($diff, 2) }}
                        </span>
                    </div>

                    <div style="display:flex;align-items:center;justify-content:space-between;">
                        <span style="font-size:12px;color:#6b7280;">Resultado</span>
                        @if($this->detalleItem['resultado'] === 'coincide')
                            <span class="liq-badge liq-badge-comp-ok">✔ Coincide</span>
                        @elseif($this->detalleItem['resultado'] === 'discrepancia')
                            <span class="liq-badge liq-badge-comp-no">✖ Discrepancia</span>
                        @else
                            <span class="liq-badge liq-badge-pendiente">— Sin resultado</span>
                        @endif
                    </div>

                    @if($this->detalleItem['observaciones'])
                    <div style="margin-top:12px;">
                        <div style="font-size:11px;color:#6b7280;font-weight:500;margin-bottom:4px;">Observaciones</div>
                        <div style="background:#f9fafb;border-radius:10px;padding:12px 14px;font-size:13px;color:#374151;line-height:1.6;">
                            {{ $this->detalleItem['observaciones'] }}
                        </div>
                    </div>
                    @endif
                @endif
            </div>
            @endif

            {{-- Comprobantes --}}
            <div>
                <div class="liq-drawer-section-title">Comprobantes</div>
                @if(empty($this->detalleItem['comprobantes']))
                    <div style="text-align:center;padding:24px;background:#f9fafb;border-radius:10px;color:#9ca3af;font-size:13px;">
                        Sin comprobantes adjuntos
                    </div>
                @else
                    <div class="liq-comp-grid">
                        @foreach($this->detalleItem['comprobantes'] as $path)
                            @php
                                $url   = asset('storage/' . $path);
                                $ext   = strtolower(pathinfo($path, PATHINFO_EXTENSION));
                                $isImg = in_array($ext, ['jpg','jpeg','png','webp','gif']);
                            @endphp
                            <a href="{{ $url }}" target="_blank" class="liq-comp-thumb">
                                @if($isImg)
                                    <img src="{{ $url }}" alt="Comprobante">
                                @else
                                    <span style="font-size:24px;">📄</span>
                                    <span class="liq-comp-label">{{ strtoupper($ext) }}</span>
                                @endif
                            </a>
                        @endforeach
                    </div>
                @endif
            </div>

        @endif
        {{-- fin modo --}}

    </div>

    {{-- Footer: acciones según modo y tipo --}}
    <div class="liq-drawer-footer">
        @if($this->modo === 'liquidacion')
            @if(in_array($this->detalleItem['tipo'], ['combustible', 'mantenimiento']) && $this->detalleItem['liquidado'])
                <a href="{{ $this->detalleItem['pdf_route'] }}"
                   target="_blank"
                   style="display:flex;align-items:center;justify-content:center;gap:8px;padding:11px;border-radius:12px;background:#6366f1;color:#fff;font-size:13px;font-weight:600;text-decoration:none;">
                    📄 Descargar PDF Liquidación
                </a>
            @elseif(in_array($this->detalleItem['tipo'], ['combustible', 'mantenimiento']) && $this->detalleItem['tiene_comprobantes'])
                <button
                    wire:click="cerrarDetalle"
                    x-data="{}"
                    @click="$nextTick(() => $wire.abrirModalLiquidar({{ $this->detalleItem['id'] }}, '{{ $this->detalleItem['tipo'] }}'))"
                    style="width:100%;display:flex;align-items:center;justify-content:center;gap:8px;padding:11px;border-radius:12px;background:#6366f1;color:#fff;font-size:13px;font-weight:600;border:none;cursor:pointer;">
                    Liquidar esta solicitud
                </button>
            @elseif(in_array($this->detalleItem['tipo'], ['combustible', 'mantenimiento']))
                <div style="text-align:center;padding:11px;border-radius:12px;background:#f3f4f6;color:#9ca3af;font-size:13px;">
                    Sin comprobantes — no se puede liquidar
                </div>
            @endif
        @else
            {{-- Modo listado footer --}}
            @if($this->detalleItem['liquidado'])
                <a href="{{ $this->detalleItem['pdf_route'] }}"
                   target="_blank"
                   style="display:flex;align-items:center;justify-content:center;gap:8px;padding:11px;border-radius:12px;background:#6366f1;color:#fff;font-size:13px;font-weight:600;text-decoration:none;">
                    📄 Descargar PDF
                </a>
            @else
                @if(in_array($this->detalleItem['tipo'], ['combustible', 'mantenimiento']) && $this->detalleItem['tiene_comprobantes'])
                    <button
                        wire:click="cerrarDetalle"
                        x-data="{}"
                        @click="$nextTick(() => $wire.abrirModalLiquidar({{ $this->detalleItem['id'] }}, '{{ $this->detalleItem['tipo'] }}'))"
                        style="width:100%;display:flex;align-items:center;justify-content:center;gap:8px;padding:11px;border-radius:12px;background:#6366f1;color:#fff;font-size:13px;font-weight:600;border:none;cursor:pointer;">
                        Liquidar esta solicitud
                    </button>
                @elseif(in_array($this->detalleItem['tipo'], ['combustible', 'mantenimiento']))
                    <div style="text-align:center;padding:11px;border-radius:12px;background:#f3f4f6;color:#9ca3af;font-size:13px;">
                        Sin comprobantes — no se puede liquidar
                    </div>
                @endif
            @endif
        @endif
    </div>

</div>
@endif

</x-filament::page>