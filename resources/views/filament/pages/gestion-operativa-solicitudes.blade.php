<x-filament-panels::page>
    <div class="space-y-5">

        <div class="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <div class="flex flex-col gap-5">
                <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 class="text-2xl font-bold tracking-tight">Gestión Operativa de Solicitudes</h1>
                        <p class="text-sm text-gray-500">
                            Un solo flujo para recepción, revisión y aprobación.
                        </p>
                    </div>

                    <div class="flex flex-wrap gap-2">
                        <x-filament::button size="sm" color="gray" wire:click="setMesActual">
                            Mes actual
                        </x-filament::button>

                        <x-filament::button size="sm" color="gray" wire:click="limpiarFiltros">
                            Limpiar filtros
                        </x-filament::button>
                    </div>
                </div>

                <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <button
                        wire:click="cambiarEtapa('bandeja')"
                        class="rounded-2xl border p-4 text-left transition-all
                            {{ $etapa === 'bandeja' ? 'border-primary-500 bg-primary-50 shadow-sm ring-1 ring-primary-200' : 'border-gray-200 bg-white hover:bg-gray-50' }}"
                    >
                        <div class="text-xs uppercase tracking-wide text-gray-500">Paso 1</div>
                        <div class="mt-1 text-lg font-semibold">Bandeja Operativa</div>
                        <div class="mt-1 text-sm text-gray-500">Recepción, clasificación y prioridad inicial.</div>
                    </button>

                    <button
                        wire:click="cambiarEtapa('revision')"
                        class="rounded-2xl border p-4 text-left transition-all
                            {{ $etapa === 'revision' ? 'border-warning-500 bg-warning-50 shadow-sm ring-1 ring-warning-200' : 'border-gray-200 bg-white hover:bg-gray-50' }}"
                    >
                        <div class="text-xs uppercase tracking-wide text-gray-500">Paso 2</div>
                        <div class="mt-1 text-lg font-semibold">Revisión Operativa</div>
                        <div class="mt-1 text-sm text-gray-500">Validación técnica, observaciones y derivación.</div>
                    </button>

                    <button
                        wire:click="cambiarEtapa('aprobaciones')"
                        class="rounded-2xl border p-4 text-left transition-all
                            {{ $etapa === 'aprobaciones' ? 'border-success-500 bg-success-50 shadow-sm ring-1 ring-success-200' : 'border-gray-200 bg-white hover:bg-gray-50' }}"
                    >
                        <div class="text-xs uppercase tracking-wide text-gray-500">Paso 3</div>
                        <div class="mt-1 text-lg font-semibold">Aprobaciones</div>
                        <div class="mt-1 text-sm text-gray-500">Resolución administrativa final.</div>
                    </button>
                </div>

                <div class="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                    <div class="text-sm font-medium text-gray-700">Etapa actual</div>
                    <div class="mt-1 text-sm text-gray-500">{{ $this->etapaLabel() }}</div>
                </div>
            </div>
        </div>

        <div class="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
            <div class="flex flex-col gap-4">
                <div class="flex items-center justify-between">
                    <div>
                        <h2 class="text-sm font-semibold text-gray-900">Filtros rápidos</h2>
                        <p class="text-xs text-gray-500">Mantienen el contexto al cambiar de etapa.</p>
                    </div>
                </div>

                {{ $this->form }}
            </div>
        </div>

        <div class="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <div class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div class="text-xs uppercase tracking-wide text-gray-500">Total</div>
                <div class="mt-2 text-2xl font-bold">{{ $kpi_total }}</div>
            </div>

            <div class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div class="text-xs uppercase tracking-wide text-gray-500">{{ $kpi_a_label }}</div>
                <div class="mt-2 text-2xl font-bold">{{ $kpi_a }}</div>
            </div>

            <div class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div class="text-xs uppercase tracking-wide text-gray-500">{{ $kpi_b_label }}</div>
                <div class="mt-2 text-2xl font-bold">{{ $kpi_b }}</div>
            </div>

            <div class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div class="text-xs uppercase tracking-wide text-gray-500">{{ $kpi_c_label }}</div>
                <div class="mt-2 text-2xl font-bold">{{ $kpi_c }}</div>
            </div>
        </div>

        <div class="space-y-4">
            @forelse ($this->paginatedRows as $row)
                <div class="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div class="min-w-0 flex-1">
                            <div class="flex flex-wrap items-center gap-2">
                                <span class="fi-badge fi-color-gray">{{ ucfirst($row['tipo']) }}</span>
                                <span class="font-mono text-sm font-semibold text-gray-900">{{ $row['codigo'] }}</span>
                                <span class="text-sm text-gray-400">•</span>
                                <span class="text-sm text-gray-500">
                                    {{ $row['fecha_ingreso'] ? \Carbon\Carbon::parse($row['fecha_ingreso'])->format('d/m/Y H:i') : '—' }}
                                </span>
                            </div>

                            <div class="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                                <div>
                                    <div class="text-xs uppercase tracking-wide text-gray-500">Solicitante</div>
                                    <div class="mt-1 text-sm font-medium text-gray-900">{{ $row['solicitante'] }}</div>
                                </div>

                                <div>
                                    <div class="text-xs uppercase tracking-wide text-gray-500">Unidad</div>
                                    <div class="mt-1 text-sm font-medium text-gray-900">{{ $row['unidad'] }}</div>
                                </div>

                                <div>
                                    <div class="text-xs uppercase tracking-wide text-gray-500">Prioridad</div>
                                    <div class="mt-1 text-sm font-medium text-gray-900">{{ strtoupper($row['prioridad']) }}</div>
                                </div>

                                <div>
                                    <div class="text-xs uppercase tracking-wide text-gray-500">Estado</div>
                                    <div class="mt-1">
                                        <span class="fi-badge fi-color-gray">
                                            {{ ucfirst(str_replace('_', ' ', $row['estado'])) }}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div class="mt-4">
                                <div class="text-xs uppercase tracking-wide text-gray-500">Detalle</div>
                                <div class="mt-1 text-sm text-gray-700">
                                    {{ $row['detalle'] }}
                                </div>
                            </div>
                        </div>

                        <div class="w-full lg:w-auto lg:min-w-[260px]">
                            <div class="rounded-2xl bg-gray-50 p-3">
                                <div class="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Acciones disponibles
                                </div>

                                @if($etapa === 'bandeja')
                                    <div class="flex flex-col gap-2">
                                        @if($row['estado'] === 'pendiente')
                                            <x-filament::button
                                                size="sm"
                                                wire:click="tomarParaRevision('{{ $row['tipo'] }}', {{ $row['id'] }})"
                                            >
                                                Tomar revisión
                                            </x-filament::button>
                                        @endif

                                        <div class="grid grid-cols-3 gap-2">
                                            <x-filament::button size="sm" color="gray"
                                                wire:click="cambiarPrioridad('{{ $row['tipo'] }}', {{ $row['id'] }}, 'alta')">
                                                Alta
                                            </x-filament::button>

                                            <x-filament::button size="sm" color="gray"
                                                wire:click="cambiarPrioridad('{{ $row['tipo'] }}', {{ $row['id'] }}, 'media')">
                                                Media
                                            </x-filament::button>

                                            <x-filament::button size="sm" color="gray"
                                                wire:click="cambiarPrioridad('{{ $row['tipo'] }}', {{ $row['id'] }}, 'baja')">
                                                Baja
                                            </x-filament::button>
                                        </div>
                                    </div>
                                @endif

                                @if($etapa === 'revision')
                                    <div class="flex flex-col gap-2">
                                        <x-filament::modal width="2xl">
                                            <x-slot name="trigger">
                                                <x-filament::button size="sm" color="success" class="w-full">
                                                    Validar
                                                </x-filament::button>
                                            </x-slot>

                                            <x-slot name="heading">Validar y enviar a preaprobación</x-slot>

                                            <form wire:submit.prevent="validar('{{ $row['tipo'] }}', {{ $row['id'] }}, {
                                                comentario: $refs.comentarioVal{{ $row['tipo'] }}{{ $row['id'] }}.value,
                                                datos_completos: $refs.datosVal{{ $row['tipo'] }}{{ $row['id'] }}.checked,
                                                fechas_validas: $refs.fechasVal{{ $row['tipo'] }}{{ $row['id'] }}.checked,
                                                recursos_disponibles: $refs.recursosVal{{ $row['tipo'] }}{{ $row['id'] }}.checked,
                                                reglas_minimas: $refs.reglasVal{{ $row['tipo'] }}{{ $row['id'] }}.checked,
                                                hallazgos: $refs.hallazgosVal{{ $row['tipo'] }}{{ $row['id'] }}.value
                                            })" class="space-y-4">
                                                <div class="grid grid-cols-2 gap-3">
                                                    <label><input type="checkbox" x-ref="datosVal{{ $row['tipo'] }}{{ $row['id'] }}"> Datos completos</label>
                                                    <label><input type="checkbox" x-ref="fechasVal{{ $row['tipo'] }}{{ $row['id'] }}"> Fechas válidas</label>
                                                    <label><input type="checkbox" x-ref="recursosVal{{ $row['tipo'] }}{{ $row['id'] }}"> Recursos disponibles</label>
                                                    <label><input type="checkbox" x-ref="reglasVal{{ $row['tipo'] }}{{ $row['id'] }}"> Reglas mínimas</label>
                                                </div>

                                                <textarea x-ref="hallazgosVal{{ $row['tipo'] }}{{ $row['id'] }}" class="w-full rounded-lg border-gray-300" rows="3" placeholder="Hallazgos"></textarea>
                                                <textarea x-ref="comentarioVal{{ $row['tipo'] }}{{ $row['id'] }}" class="w-full rounded-lg border-gray-300" rows="4" placeholder="Comentario final de revisión" required></textarea>

                                                <div class="flex justify-end">
                                                    <x-filament::button type="submit" color="success">
                                                        Enviar a preaprobación
                                                    </x-filament::button>
                                                </div>
                                            </form>
                                        </x-filament::modal>

                                        <div class="grid grid-cols-2 gap-2">
                                            <x-filament::modal width="2xl">
                                                <x-slot name="trigger">
                                                    <x-filament::button size="sm" color="gray" class="w-full">
                                                        Observar
                                                    </x-filament::button>
                                                </x-slot>

                                                <x-slot name="heading">Observación de revisión operativa</x-slot>

                                                <form wire:submit.prevent="observarRevision('{{ $row['tipo'] }}', {{ $row['id'] }}, {
                                                    comentario: $refs.comentarioObs{{ $row['tipo'] }}{{ $row['id'] }}.value,
                                                    datos_completos: $refs.datosObs{{ $row['tipo'] }}{{ $row['id'] }}.checked,
                                                    fechas_validas: $refs.fechasObs{{ $row['tipo'] }}{{ $row['id'] }}.checked,
                                                    recursos_disponibles: $refs.recursosObs{{ $row['tipo'] }}{{ $row['id'] }}.checked,
                                                    reglas_minimas: $refs.reglasObs{{ $row['tipo'] }}{{ $row['id'] }}.checked,
                                                    hallazgos: $refs.hallazgosObs{{ $row['tipo'] }}{{ $row['id'] }}.value
                                                })" class="space-y-4">
                                                    <div class="grid grid-cols-2 gap-3">
                                                        <label><input type="checkbox" x-ref="datosObs{{ $row['tipo'] }}{{ $row['id'] }}"> Datos completos</label>
                                                        <label><input type="checkbox" x-ref="fechasObs{{ $row['tipo'] }}{{ $row['id'] }}"> Fechas válidas</label>
                                                        <label><input type="checkbox" x-ref="recursosObs{{ $row['tipo'] }}{{ $row['id'] }}"> Recursos disponibles</label>
                                                        <label><input type="checkbox" x-ref="reglasObs{{ $row['tipo'] }}{{ $row['id'] }}"> Reglas mínimas</label>
                                                    </div>

                                                    <textarea x-ref="hallazgosObs{{ $row['tipo'] }}{{ $row['id'] }}" class="w-full rounded-lg border-gray-300" rows="3" placeholder="Hallazgos técnicos"></textarea>
                                                    <textarea x-ref="comentarioObs{{ $row['tipo'] }}{{ $row['id'] }}" class="w-full rounded-lg border-gray-300" rows="4" placeholder="Comentario / devolución" required></textarea>

                                                    <div class="flex justify-end">
                                                        <x-filament::button type="submit">
                                                            Guardar observación
                                                        </x-filament::button>
                                                    </div>
                                                </form>
                                            </x-filament::modal>

                                            <x-filament::modal width="2xl">
                                                <x-slot name="trigger">
                                                    <x-filament::button size="sm" color="warning" class="w-full">
                                                        Derivar
                                                    </x-filament::button>
                                                </x-slot>

                                                <x-slot name="heading">Derivar solicitud</x-slot>

                                                <form wire:submit.prevent="derivar('{{ $row['tipo'] }}', {{ $row['id'] }}, {
                                                    derivado_a: $refs.usuarioDer{{ $row['tipo'] }}{{ $row['id'] }}.value,
                                                    comentario: $refs.comentarioDer{{ $row['tipo'] }}{{ $row['id'] }}.value,
                                                    datos_completos: $refs.datosDer{{ $row['tipo'] }}{{ $row['id'] }}.checked,
                                                    fechas_validas: $refs.fechasDer{{ $row['tipo'] }}{{ $row['id'] }}.checked,
                                                    recursos_disponibles: $refs.recursosDer{{ $row['tipo'] }}{{ $row['id'] }}.checked,
                                                    reglas_minimas: $refs.reglasDer{{ $row['tipo'] }}{{ $row['id'] }}.checked,
                                                    hallazgos: $refs.hallazgosDer{{ $row['tipo'] }}{{ $row['id'] }}.value
                                                })" class="space-y-4">
                                                    <select x-ref="usuarioDer{{ $row['tipo'] }}{{ $row['id'] }}" class="w-full rounded-lg border-gray-300" required>
                                                        <option value="">Seleccione usuario</option>
                                                        @foreach($this->usuariosOptions() as $id => $nombre)
                                                            <option value="{{ $id }}">{{ $nombre }}</option>
                                                        @endforeach
                                                    </select>

                                                    <div class="grid grid-cols-2 gap-3">
                                                        <label><input type="checkbox" x-ref="datosDer{{ $row['tipo'] }}{{ $row['id'] }}"> Datos completos</label>
                                                        <label><input type="checkbox" x-ref="fechasDer{{ $row['tipo'] }}{{ $row['id'] }}"> Fechas válidas</label>
                                                        <label><input type="checkbox" x-ref="recursosDer{{ $row['tipo'] }}{{ $row['id'] }}"> Recursos disponibles</label>
                                                        <label><input type="checkbox" x-ref="reglasDer{{ $row['tipo'] }}{{ $row['id'] }}"> Reglas mínimas</label>
                                                    </div>

                                                    <textarea x-ref="hallazgosDer{{ $row['tipo'] }}{{ $row['id'] }}" class="w-full rounded-lg border-gray-300" rows="3" placeholder="Hallazgos"></textarea>
                                                    <textarea x-ref="comentarioDer{{ $row['tipo'] }}{{ $row['id'] }}" class="w-full rounded-lg border-gray-300" rows="4" placeholder="Comentario de derivación" required></textarea>

                                                    <div class="flex justify-end">
                                                        <x-filament::button type="submit" color="warning">
                                                            Derivar
                                                        </x-filament::button>
                                                    </div>
                                                </form>
                                            </x-filament::modal>
                                        </div>
                                    </div>
                                @endif

                                @if($etapa === 'aprobaciones')
                                    <div class="flex flex-col gap-2">
                                        <x-filament::modal width="xl">
                                            <x-slot name="trigger">
                                                <x-filament::button size="sm" color="success" class="w-full">
                                                    Aprobar
                                                </x-filament::button>
                                            </x-slot>

                                            <x-slot name="heading">Aprobar solicitud</x-slot>

                                            <form wire:submit.prevent="aprobar('{{ $row['tipo'] }}', {{ $row['id'] }}, {
                                                comentario: $refs.aprobarComentario{{ $row['tipo'] }}{{ $row['id'] }}.value
                                            })" class="space-y-4">
                                                <textarea x-ref="aprobarComentario{{ $row['tipo'] }}{{ $row['id'] }}" class="w-full rounded-lg border-gray-300" rows="4" placeholder="Comentario de aprobación" required></textarea>
                                                <div class="flex justify-end">
                                                    <x-filament::button type="submit" color="success">Confirmar aprobación</x-filament::button>
                                                </div>
                                            </form>
                                        </x-filament::modal>

                                        <div class="grid grid-cols-3 gap-2">
                                            <x-filament::modal width="xl">
                                                <x-slot name="trigger">
                                                    <x-filament::button size="sm" color="danger" class="w-full">
                                                        Rechazar
                                                    </x-filament::button>
                                                </x-slot>

                                                <x-slot name="heading">Rechazar solicitud</x-slot>

                                                <form wire:submit.prevent="rechazar('{{ $row['tipo'] }}', {{ $row['id'] }}, {
                                                    comentario: $refs.rechazarComentario{{ $row['tipo'] }}{{ $row['id'] }}.value
                                                })" class="space-y-4">
                                                    <textarea x-ref="rechazarComentario{{ $row['tipo'] }}{{ $row['id'] }}" class="w-full rounded-lg border-gray-300" rows="4" placeholder="Motivo del rechazo" required></textarea>
                                                    <div class="flex justify-end">
                                                        <x-filament::button type="submit" color="danger">Confirmar rechazo</x-filament::button>
                                                    </div>
                                                </form>
                                            </x-filament::modal>

                                            <x-filament::modal width="xl">
                                                <x-slot name="trigger">
                                                    <x-filament::button size="sm" color="warning" class="w-full">
                                                        Condicionar
                                                    </x-filament::button>
                                                </x-slot>

                                                <x-slot name="heading">Condicionar solicitud</x-slot>

                                                <form wire:submit.prevent="condicionar('{{ $row['tipo'] }}', {{ $row['id'] }}, {
                                                    comentario: $refs.condComentario{{ $row['tipo'] }}{{ $row['id'] }}.value
                                                })" class="space-y-4">
                                                    <textarea x-ref="condComentario{{ $row['tipo'] }}{{ $row['id'] }}" class="w-full rounded-lg border-gray-300" rows="4" placeholder="Condiciones requeridas" required></textarea>
                                                    <div class="flex justify-end">
                                                        <x-filament::button type="submit" color="warning">Enviar con condiciones</x-filament::button>
                                                    </div>
                                                </form>
                                            </x-filament::modal>

                                            <x-filament::modal width="xl">
                                                <x-slot name="trigger">
                                                    <x-filament::button size="sm" color="gray" class="w-full">
                                                        Reabrir
                                                    </x-filament::button>
                                                </x-slot>

                                                <x-slot name="heading">Reabrir solicitud</x-slot>

                                                <form wire:submit.prevent="reabrir('{{ $row['tipo'] }}', {{ $row['id'] }}, {
                                                    comentario: $refs.reabrirComentario{{ $row['tipo'] }}{{ $row['id'] }}.value
                                                })" class="space-y-4">
                                                    <textarea x-ref="reabrirComentario{{ $row['tipo'] }}{{ $row['id'] }}" class="w-full rounded-lg border-gray-300" rows="4" placeholder="Motivo para reabrir" required></textarea>
                                                    <div class="flex justify-end">
                                                        <x-filament::button type="submit" color="gray">Confirmar reapertura</x-filament::button>
                                                    </div>
                                                </form>
                                            </x-filament::modal>
                                        </div>
                                    </div>
                                @endif
                            </div>
                        </div>
                    </div>
                </div>
            @empty
                <div class="rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500 shadow-sm">
                    No hay solicitudes para esta etapa.
                </div>
            @endforelse
        </div>

        <div class="pt-2">
            {{ $this->paginatedRows->links() }}
        </div>
    </div>
</x-filament-panels::page>