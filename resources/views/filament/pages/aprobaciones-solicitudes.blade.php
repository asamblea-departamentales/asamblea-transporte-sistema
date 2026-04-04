<x-filament-panels::page>
    <div class="space-y-6">

        {{ $this->form }}

        {{-- KPIs --}}
        <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
            <x-filament::section>
                <div class="text-sm text-gray-500">Total</div>
                <div class="text-2xl font-semibold">{{ $kpi_total }}</div>
            </x-filament::section>
            <x-filament::section>
                <div class="text-sm text-gray-500">Transporte</div>
                <div class="text-2xl font-semibold">{{ $kpi_transporte }}</div>
            </x-filament::section>
            <x-filament::section>
                <div class="text-sm text-gray-500">Combustible</div>
                <div class="text-2xl font-semibold">{{ $kpi_combustible }}</div>
            </x-filament::section>
            <x-filament::section>
                <div class="text-sm text-gray-500">Mantenimiento</div>
                <div class="text-2xl font-semibold">{{ $kpi_mantenimiento }}</div>
            </x-filament::section>
        </div>

        {{-- Tabla --}}
        <x-filament::section>
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="border-b">
                        <tr class="text-left">
                            <th class="py-3 pr-4">Tipo</th>
                            <th class="py-3 pr-4">Código</th>
                            <th class="py-3 pr-4">Fecha</th>
                            <th class="py-3 pr-4">Solicitante</th>
                            <th class="py-3 pr-4">Unidad</th>
                            <th class="py-3 pr-4">Detalle</th>
                            <th class="py-3 pr-4">Prioridad</th>
                            <th class="py-3 pr-4">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse ($this->paginatedRows as $row)
                            <tr class="border-b align-top">
                                <td class="py-3 pr-4">{{ ucfirst($row['tipo']) }}</td>
                                <td class="py-3 pr-4 font-mono">{{ $row['codigo'] }}</td>
                                <td class="py-3 pr-4">
                                    {{ $row['fecha_ingreso'] ? \Carbon\Carbon::parse($row['fecha_ingreso'])->format('d/m/Y H:i') : '—' }}
                                </td>
                                <td class="py-3 pr-4">{{ $row['solicitante'] }}</td>
                                <td class="py-3 pr-4">{{ $row['unidad'] }}</td>
                                <td class="py-3 pr-4">{{ $row['detalle'] }}</td>
                                <td class="py-3 pr-4">{{ strtoupper($row['prioridad']) }}</td>
                                <td class="py-3 pr-4">
                                    <div class="flex flex-wrap gap-2">

                                        {{-- ═══════════════════════════════════════
                                             APROBAR — con canvas de firma
                                        ════════════════════════════════════════ --}}
                                        <div
                                            x-data="{
                                                open: false,
                                                comentario: '',
                                                firma: null,
                                                canvas: null,
                                                ctx: null,
                                                drawing: false,
                                                lastX: 0,
                                                lastY: 0,

                                                openModal() {
    this.comentario = '';
    this.firma = null;
    this.open = true;
    setTimeout(() => {
        this.canvas = this.$refs.firmaCanvas;
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.ctx.strokeStyle = '#1e3a5f';
        this.ctx.lineWidth   = 2;
        this.ctx.lineCap     = 'round';
        this.ctx.lineJoin    = 'round';
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }, 150);
},

                                                getPos(e) {
                                                    const rect = this.canvas.getBoundingClientRect();
                                                    const src  = e.touches ? e.touches[0] : e;
                                                    return {
                                                        x: (src.clientX - rect.left) * (this.canvas.width  / rect.width),
                                                        y: (src.clientY - rect.top)  * (this.canvas.height / rect.height),
                                                    };
                                                },

                                                startDraw(e) {
                                                    e.preventDefault();
                                                    this.drawing = true;
                                                    const p = this.getPos(e);
                                                    this.lastX = p.x;
                                                    this.lastY = p.y;
                                                },

                                                onDraw(e) {
                                                    if (!this.drawing) return;
                                                    e.preventDefault();
                                                    const p = this.getPos(e);
                                                    this.ctx.beginPath();
                                                    this.ctx.moveTo(this.lastX, this.lastY);
                                                    this.ctx.lineTo(p.x, p.y);
                                                    this.ctx.stroke();
                                                    this.lastX = p.x;
                                                    this.lastY = p.y;
                                                },

                                                stopDraw() {
                                                    if (!this.drawing) return;
                                                    this.drawing = false;
                                                    this.firma = this.canvas.toDataURL('image/png');
                                                },

                                                clearFirma() {
                                                    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
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
                                            {{-- Trigger --}}
                                            <button
    type="button"
    @click="openModal()"
    class="inline-flex items-center justify-center gap-1 rounded-lg px-3 py-1.5 text-sm font-semibold text-white shadow-sm bg-green-600 hover:bg-green-500 focus:outline-none"
>
    Aprobar
</button>

                                            {{-- Overlay --}}
                                            <div
                                                x-show="open"
                                                x-transition.opacity
                                                class="fixed inset-0 z-40 bg-black/50"
                                                @click="open = false"
                                                style="display:none"
                                            ></div>

                                            {{-- Dialog --}}
                                            <div
                                                x-show="open"
                                                x-transition
                                                class="fixed inset-0 z-50 flex items-center justify-center p-4"
                                                style="display:none"
                                            >
                                                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4">

                                                    <h2 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                                        <x-filament::icon icon="heroicon-o-check-circle" class="w-5 h-5 text-green-500" />
                                                        Aprobar solicitud
                                                        <span class="text-sm font-mono text-gray-400">{{ $row['codigo'] }}</span>
                                                    </h2>

                                                    {{-- Comentario --}}
                                                    <div>
                                                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Comentario de aprobación <span class="text-red-500">*</span>
                                                        </label>
                                                        <textarea
                                                            x-model="comentario"
                                                            rows="3"
                                                            class="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                                            placeholder="Motivo o comentario de aprobación..."
                                                        ></textarea>
                                                    </div>

                                                    {{-- Firma (solo si es transporte) --}}
                                                    @if($row['tipo'] === 'transporte')
                                                    <div>
                                                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Firma del aprobador
                                                            <span class="text-xs text-gray-400 font-normal">(aparecerá en el PDF)</span>
                                                        </label>
                                                        <div
                                                            class="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white"
                                                            style="touch-action: none;"
                                                        >
                                                            <canvas
                                                                x-ref="firmaCanvas"
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
                                                        <button
                                                            type="button"
                                                            @click="clearFirma"
                                                            class="mt-1 text-xs text-red-500 hover:text-red-700 underline"
                                                        >
                                                            ✕ Limpiar firma
                                                        </button>
                                                    </div>
                                                    @endif

                                                    {{-- Acciones --}}
                                                    <div class="flex justify-end gap-3 pt-2">
                                                        <x-filament::button
                                                            color="gray"
                                                            @click="open = false"
                                                        >
                                                            Cancelar
                                                        </x-filament::button>
                                                        <x-filament::button
                                                            color="success"
                                                            @click="confirmar"
                                                            x-bind:disabled="!comentario.trim()"
                                                        >
                                                            Confirmar aprobación
                                                        </x-filament::button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {{-- ═══════════════════════════════════════ --}}

                                        {{-- RECHAZAR --}}
                                        <x-filament::modal width="xl">
                                            <x-slot name="trigger">
                                                <x-filament::button size="sm" color="danger">
                                                    Rechazar
                                                </x-filament::button>
                                            </x-slot>
                                            <x-slot name="heading">Rechazar solicitud</x-slot>
                                            <form wire:submit.prevent="rechazar('{{ $row['tipo'] }}', {{ $row['id'] }}, {
                                                comentario: $refs.rechazarComentario{{ $row['tipo'] }}{{ $row['id'] }}.value
                                            })" class="space-y-4">
                                                <textarea
                                                    x-ref="rechazarComentario{{ $row['tipo'] }}{{ $row['id'] }}"
                                                    class="w-full rounded-lg border-gray-300"
                                                    rows="4"
                                                    placeholder="Motivo del rechazo"
                                                    required
                                                ></textarea>
                                                <div class="flex justify-end">
                                                    <x-filament::button type="submit" color="danger">
                                                        Confirmar rechazo
                                                    </x-filament::button>
                                                </div>
                                            </form>
                                        </x-filament::modal>

                                        {{-- CONDICIONAR --}}
                                        <x-filament::modal width="xl">
                                            <x-slot name="trigger">
                                                <x-filament::button size="sm" color="warning">
                                                    Condicionar
                                                </x-filament::button>
                                            </x-slot>
                                            <x-slot name="heading">Condicionar solicitud</x-slot>
                                            <form wire:submit.prevent="condicionar('{{ $row['tipo'] }}', {{ $row['id'] }}, {
                                                comentario: $refs.condComentario{{ $row['tipo'] }}{{ $row['id'] }}.value
                                            })" class="space-y-4">
                                                <textarea
                                                    x-ref="condComentario{{ $row['tipo'] }}{{ $row['id'] }}"
                                                    class="w-full rounded-lg border-gray-300"
                                                    rows="4"
                                                    placeholder="Condiciones o ajustes requeridos"
                                                    required
                                                ></textarea>
                                                <div class="flex justify-end">
                                                    <x-filament::button type="submit" color="warning">
                                                        Enviar con condiciones
                                                    </x-filament::button>
                                                </div>
                                            </form>
                                        </x-filament::modal>

                                        {{-- REABRIR --}}
                                        <x-filament::modal width="xl">
                                            <x-slot name="trigger">
                                                <x-filament::button size="sm" color="gray">
                                                    Reabrir
                                                </x-filament::button>
                                            </x-slot>
                                            <x-slot name="heading">Reabrir solicitud</x-slot>
                                            <form wire:submit.prevent="reabrir('{{ $row['tipo'] }}', {{ $row['id'] }}, {
                                                comentario: $refs.reabrirComentario{{ $row['tipo'] }}{{ $row['id'] }}.value
                                            })" class="space-y-4">
                                                <textarea
                                                    x-ref="reabrirComentario{{ $row['tipo'] }}{{ $row['id'] }}"
                                                    class="w-full rounded-lg border-gray-300"
                                                    rows="4"
                                                    placeholder="Motivo para reabrir"
                                                    required
                                                ></textarea>
                                                <div class="flex justify-end">
                                                    <x-filament::button type="submit" color="gray">
                                                        Confirmar reapertura
                                                    </x-filament::button>
                                                </div>
                                            </form>
                                        </x-filament::modal>

                                    </div>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="8" class="py-6 text-center text-gray-500">
                                    No hay solicitudes listas para aprobación.
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

            <div class="mt-4">
                {{ $this->paginatedRows->links() }}
            </div>
        </x-filament::section>

    </div>
</x-filament-panels::page>