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

    /* Modal */
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
</style>

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
            <option value="combustible">⛽ Combustible</option>
            <option value="mantenimiento">🔧 Mantenimiento</option>
        </select>
    </div>
    <div class="liq-filter-group">
        <label>Estado</label>
        <select wire:model.live="estado">
            <option value="">Todos</option>
            <option value="pendiente">⏳ Pendiente</option>
            <option value="liquidado">✔ Liquidado</option>
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
        <div class="liq-card {{ $item['liquidado'] ? 'liquidado' : 'pendiente' }}">

            <div class="liq-tipo-badge {{ $item['tipo'] === 'combustible' ? 'liq-tipo-combustible' : 'liq-tipo-mantenimiento' }}">
                {{ $item['tipo'] === 'combustible' ? '⛽' : '🔧' }}
            </div>

            <div class="liq-info">
                <div class="liq-codigo">{{ $item['codigo'] }}</div>
                <div class="liq-meta">
                    {{ $item['vehiculo'] ?? '—' }} &middot; {{ $item['solicitante'] ?? '—' }}
                </div>
                <div class="liq-fecha">
                    {{ $item['fecha'] ? \Carbon\Carbon::parse($item['fecha'])->format('d/m/Y') : '—' }}
                </div>
            </div>

            <div style="display:flex;flex-direction:column;gap:5px;align-items:flex-end;flex-shrink:0;">
                @if($item['liquidado'])
                    <span class="liq-badge liq-badge-liquidado">✔ Liquidado</span>
                @else
                    <span class="liq-badge liq-badge-pendiente">⏳ Pendiente</span>
                @endif
                @if($item['tiene_comprobantes'])
                    <span class="liq-badge liq-badge-comp-ok">📎 Con comp.</span>
                @else
                    <span class="liq-badge liq-badge-comp-no">✖ Sin comp.</span>
                @endif
            </div>

            <div class="liq-monto-valor">${{ number_format($item['monto'], 2) }}</div>

            <div class="liq-actions">
                @if(!$item['liquidado'] && $item['tiene_comprobantes'])
                    <button
                        wire:click="abrirModalLiquidar({{ $item['id'] }}, '{{ $item['tipo'] }}')"
                        class="liq-btn liq-btn-liquidar">
                        Liquidar
                    </button>
                @endif

                @if($item['liquidado'])
                    <a href="{{ $item['tipo'] === 'combustible'
                        ? route('liquidacion.combustible.pdf', $item['id'])
                        : route('liquidacion.mantenimiento.pdf', $item['id']) }}"
                       target="_blank"
                       class="liq-btn liq-btn-pdf">
                        📄 PDF
                    </a>
                @endif
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
    <div class="liq-modal">

        <div class="liq-modal-header">
            <h3 class="liq-modal-title">Registrar Liquidación</h3>
            <button class="liq-modal-close" wire:click="cerrarModal">&times;</button>
        </div>

        <div style="display:flex;flex-direction:column;gap:14px;">

            <div class="liq-field">
                <label>Monto Validado (USD)</label>
                <input
                    type="number"
                    step="0.01"
                    wire:model="monto_validado"
                    placeholder="0.00"
                >
                @error('monto_validado')
                    <span class="liq-field-error">{{ $message }}</span>
                @enderror
            </div>

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
                <textarea
                    wire:model="observaciones"
                    rows="3"
                    placeholder="Notas contables opcionales..."
                ></textarea>
            </div>

        </div>

        <div class="liq-modal-footer">
            <button class="liq-btn-cancel" wire:click="cerrarModal">
                Cancelar
            </button>
            <button class="liq-btn-confirm" wire:click="confirmarLiquidacion">
                Confirmar Liquidación
            </button>
        </div>

    </div>
</div>
@endif

</x-filament::page>