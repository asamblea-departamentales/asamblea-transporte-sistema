<x-filament-panels::page>

<style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

    #calendario-flota * { font-family: 'DM Sans', sans-serif; }

    /* ── Leyenda ──────────────────────────────────────────────── */
    .flota-leyenda {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        align-items: center;
    }
    .flota-leyenda-item {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        font-weight: 600;
        color: #374151;
    }
    .flota-leyenda-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        flex-shrink: 0;
    }

    /* ── FullCalendar overrides ──────────────────────────────── */
    #fc-wrap .fc {
        font-family: 'DM Sans', sans-serif;
        font-size: 13px;
    }
    #fc-wrap .fc-toolbar-title {
        font-size: 16px;
        font-weight: 700;
        color: #111827;
        text-transform: capitalize;
    }
    #fc-wrap .fc-button {
        background: #fff !important;
        border: 1.5px solid #e5e7eb !important;
        color: #374151 !important;
        font-size: 12px !important;
        font-weight: 600 !important;
        border-radius: 8px !important;
        padding: 5px 12px !important;
        box-shadow: none !important;
        transition: background .15s !important;
    }
    #fc-wrap .fc-button:hover {
        background: #f9fafb !important;
        border-color: #d1d5db !important;
    }
    #fc-wrap .fc-button-active,
    #fc-wrap .fc-button:focus {
        background: #f3f4f6 !important;
        border-color: #6366f1 !important;
        color: #4338ca !important;
        outline: none !important;
        box-shadow: none !important;
    }
    #fc-wrap .fc-col-header-cell-cushion {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: .06em;
        color: #9ca3af;
        text-decoration: none;
    }
    #fc-wrap .fc-daygrid-day-number {
        font-size: 12px;
        font-weight: 600;
        color: #374151;
        text-decoration: none;
    }
    #fc-wrap .fc-daygrid-day.fc-day-today {
        background: #eef2ff !important;
    }
    #fc-wrap .fc-daygrid-day.fc-day-today .fc-daygrid-day-number {
        color: #4338ca;
        font-weight: 700;
    }
    #fc-wrap .fc-event {
        border-radius: 6px !important;
        border: none !important;
        padding: 2px 6px !important;
        font-size: 11px !important;
        font-weight: 600 !important;
        cursor: pointer;
        transition: opacity .15s;
    }
    #fc-wrap .fc-event:hover { opacity: .85; }
    #fc-wrap .fc-event-title { font-size: 11px; font-weight: 600; }
    #fc-wrap .fc-list-event-title a { text-decoration: none; color: inherit; }
    #fc-wrap .fc-list-day-cushion {
        background: #f3f4f6 !important;
        font-size: 12px;
        font-weight: 700;
        color: #374151;
    }
    #fc-wrap .fc-scrollgrid { border-color: #f3f4f6 !important; }
    #fc-wrap td, #fc-wrap th { border-color: #f3f4f6 !important; }
    #fc-wrap .fc-timegrid-slot { height: 40px !important; }

    /* ── Tooltip personalizado ───────────────────────────────── */
    #flota-tooltip {
        position: fixed;
        z-index: 9999;
        background: #fff;
        border: 1.5px solid #e5e7eb;
        border-radius: 14px;
        padding: 14px 16px;
        min-width: 220px;
        max-width: 300px;
        box-shadow: 0 8px 24px rgba(0,0,0,.12);
        pointer-events: none;
        opacity: 0;
        transition: opacity .15s;
        font-family: 'DM Sans', sans-serif;
        font-size: 12px;
    }
    #flota-tooltip.visible { opacity: 1; }
    .tooltip-row {
        display: flex;
        gap: 6px;
        margin-bottom: 5px;
        align-items: flex-start;
    }
    .tooltip-label {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: .06em;
        color: #9ca3af;
        font-weight: 700;
        white-space: nowrap;
        min-width: 64px;
        margin-top: 1px;
    }
    .tooltip-value {
        font-size: 12px;
        font-weight: 600;
        color: #111827;
        line-height: 1.3;
    }
    .tooltip-codigo {
        font-family: 'DM Mono', monospace;
        font-size: 10px;
        color: #6b7280;
        margin-bottom: 8px;
    }
    .tooltip-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 10px;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 999px;
        text-transform: uppercase;
        letter-spacing: .04em;
    }
    .tooltip-link {
        display: block;
        margin-top: 10px;
        padding: 6px 10px;
        background: #6366f1;
        color: #fff;
        border-radius: 8px;
        font-size: 11px;
        font-weight: 700;
        text-align: center;
        text-decoration: none;
        transition: background .15s;
        pointer-events: all;
    }
    .tooltip-link:hover { background: #4f46e5; }

    /* ── Filtros ─────────────────────────────────────────────── */
    .flota-filtros {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        align-items: center;
    }
    .flota-filtros select {
        font-size: 12px;
        font-weight: 600;
        padding: 6px 10px;
        border: 1.5px solid #e5e7eb;
        border-radius: 10px;
        background: #fff;
        color: #374151;
        outline: none;
        cursor: pointer;
        transition: border-color .15s;
        appearance: none;
        -webkit-appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%239ca3af'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 10px center;
        padding-right: 28px;
    }
    .flota-filtros select:focus { border-color: #6366f1; }
</style>

{{-- Tooltip flotante --}}
<div id="flota-tooltip">
    <div class="tooltip-codigo" id="tt-codigo"></div>
    <div style="margin-bottom:8px;">
        <div id="tt-badge" class="tooltip-badge"></div>
    </div>
    <div class="tooltip-row">
        <span class="tooltip-label">Vehículo</span>
        <span class="tooltip-value" id="tt-placa"></span>
    </div>
    <div class="tooltip-row">
        <span class="tooltip-label">Origen</span>
        <span class="tooltip-value" id="tt-origen"></span>
    </div>
    <div class="tooltip-row">
        <span class="tooltip-label">Destino</span>
        <span class="tooltip-value" id="tt-destino"></span>
    </div>
    <div class="tooltip-row">
        <span class="tooltip-label">Solicitante</span>
        <span class="tooltip-value" id="tt-solicitante"></span>
    </div>
    <div class="tooltip-row">
        <span class="tooltip-label">Unidad</span>
        <span class="tooltip-value" id="tt-unidad"></span>
    </div>
    <div class="tooltip-row">
        <span class="tooltip-label">Personas</span>
        <span class="tooltip-value" id="tt-personas"></span>
    </div>
    <a id="tt-link" class="tooltip-link" href="#" target="_blank">Ver solicitud →</a>
</div>

<div id="calendario-flota" class="space-y-4">

    {{-- Cabecera --}}
    <div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex items-center gap-3">
                <span class="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-600 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                </span>
                <div>
                    <h1 class="text-lg font-bold tracking-tight text-gray-900">Calendario de Flota</h1>
                    <p class="text-xs text-gray-400">Programación de vehículos en tiempo real</p>
                </div>
            </div>

            {{-- Filtros --}}
            <div class="flota-filtros">
                <select id="filtro-vehiculo" onchange="filtrarVehiculo(this.value)">
                    <option value="">Todos los vehículos</option>
                </select>
                <select id="filtro-estado" onchange="filtrarEstado(this.value)">
                    <option value="">Todos los estados</option>
                    <option value="programada">Programado</option>
                    <option value="en_ejecucion">En ejecución</option>
                    <option value="aprobada">Aprobado</option>
                </select>
            </div>
        </div>

        {{-- Leyenda --}}
        <div class="flota-leyenda mt-4 pt-4 border-t border-gray-100">
            <div class="flota-leyenda-item">
                <span class="flota-leyenda-dot" style="background:#2563eb;"></span>
                Programado
            </div>
            <div class="flota-leyenda-item">
                <span class="flota-leyenda-dot" style="background:#D85A30;"></span>
                En ejecución
            </div>
            <div class="flota-leyenda-item">
                <span class="flota-leyenda-dot" style="background:#BA7517;"></span>
                Aprobado (pendiente asignación)
            </div>
        </div>
    </div>

    {{-- Calendario --}}
    <div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div id="fc-wrap"></div>
    </div>

</div>

{{-- FullCalendar desde CDN --}}
<script src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/locales/es.global.min.js"></script>

<script>
    // Datos del servidor
    const eventosOriginales = {!! $this->getEventosJson() !!};
    const vehiculosOpts     = {!! $this->getVehiculosOptions() !!};

    let calendar;
    let filtroVehiculo = '';
    let filtroEstado   = '';

    // Poblar select de vehículos
    const selVeh = document.getElementById('filtro-vehiculo');
    Object.entries(vehiculosOpts).forEach(([id, placa]) => {
        const opt = document.createElement('option');
        opt.value = placa;
        opt.textContent = placa;
        selVeh.appendChild(opt);
    });

    // Tooltip
    const tooltip = document.getElementById('flota-tooltip');
    let tooltipTimeout;

    function mostrarTooltip(info) {
        const p = info.jsEvent;
        const ep = info.event.extendedProps;

        document.getElementById('tt-codigo').textContent      = ep.codigo ?? '';
        document.getElementById('tt-placa').textContent       = ep.placa ?? '—';
        document.getElementById('tt-origen').textContent      = ep.origen ?? '—';
        document.getElementById('tt-destino').textContent     = ep.destino ?? '—';
        document.getElementById('tt-solicitante').textContent = ep.solicitante ?? '—';
        document.getElementById('tt-unidad').textContent      = ep.unidad ?? '—';
        document.getElementById('tt-personas').textContent    = ep.personas + ' personas';
        document.getElementById('tt-link').href               = ep.url_view ?? '#';

        const badge = document.getElementById('tt-badge');
        const estadoMap = {
            programada:   { label: 'Programado',  bg: '#dbeafe', color: '#1e3a8a' },
            en_ejecucion: { label: 'En ejecución', bg: '#FAECE7', color: '#711B0C' },
            aprobada:     { label: 'Aprobado',    bg: '#FAEEDA', color: '#412402' },
        };
        const est = estadoMap[ep.estado] ?? { label: ep.estado, bg: '#f3f4f6', color: '#374151' };
        badge.textContent = est.label;
        badge.style.background = est.bg;
        badge.style.color = est.color;

        // Posición del tooltip
        const margin = 14;
        let left = p.clientX + margin;
        let top  = p.clientY + margin;
        if (left + 300 > window.innerWidth)  left = p.clientX - 300 - margin;
        if (top  + 280 > window.innerHeight) top  = p.clientY - 280 - margin;

        tooltip.style.left = left + 'px';
        tooltip.style.top  = top  + 'px';
        tooltip.classList.add('visible');
    }

    function ocultarTooltip() {
        tooltipTimeout = setTimeout(() => tooltip.classList.remove('visible'), 200);
    }

    tooltip.addEventListener('mouseenter', () => clearTimeout(tooltipTimeout));
    tooltip.addEventListener('mouseleave', ocultarTooltip);

    // Filtros
    function eventosFiltrados() {
        return eventosOriginales.filter(e => {
            const matchVeh   = !filtroVehiculo || e.extendedProps.placa === filtroVehiculo;
            const matchEst   = !filtroEstado   || e.extendedProps.estado === filtroEstado;
            return matchVeh && matchEst;
        });
    }

    function filtrarVehiculo(v) {
        filtroVehiculo = v;
        calendar.removeAllEvents();
        calendar.addEventSource(eventosFiltrados());
    }

    function filtrarEstado(e) {
        filtroEstado = e;
        calendar.removeAllEvents();
        calendar.addEventSource(eventosFiltrados());
    }

    // Inicializar FullCalendar
    document.addEventListener('DOMContentLoaded', function () {
        const el = document.getElementById('fc-wrap');

        calendar = new FullCalendar.Calendar(el, {
            locale: 'es',
            initialView: 'dayGridMonth',
            headerToolbar: {
                left:   'prev,next today',
                center: 'title',
                right:  'dayGridMonth,timeGridWeek,listWeek',
            },
            buttonText: {
                today:    'Hoy',
                month:    'Mes',
                week:     'Semana',
                list:     'Lista',
            },
            events: eventosFiltrados(),
            eventTimeFormat: {
                hour:   '2-digit',
                minute: '2-digit',
                hour12: false,
            },
            displayEventTime: true,
            eventDisplay: 'block',
            dayMaxEvents: 4,
            height: 'auto',

            // Tooltip al hacer hover
            eventMouseEnter: mostrarTooltip,
            eventMouseLeave: ocultarTooltip,

            // Click abre la solicitud directamente
            eventClick: function (info) {
                info.jsEvent.preventDefault();
                const url = info.event.extendedProps.url_view;
                if (url) window.open(url, '_blank');
            },
        });

        calendar.render();
    });
</script>

</x-filament-panels::page>