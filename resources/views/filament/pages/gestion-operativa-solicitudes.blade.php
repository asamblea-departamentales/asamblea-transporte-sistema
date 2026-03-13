<x-filament-panels::page>
    <div class="space-y-6">

        <x-filament::section>
            <div class="flex flex-col gap-4">
                <div>
                    <h2 class="text-2xl font-bold tracking-tight">Gestión Operativa de Solicitudes</h2>
                    <p class="text-sm text-gray-500">
                        Trabaja el flujo completo desde una sola pantalla: recepción, revisión y aprobación.
                    </p>
                </div>

                <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <button
                        wire:click="cambiarEtapa('bandeja')"
                        class="rounded-2xl border p-4 text-left transition
                            {{ $etapa === 'bandeja' ? 'border-primary-500 bg-primary-50 shadow-sm' : 'border-gray-200 bg-white hover:bg-gray-50' }}"
                    >
                        <div class="text-sm text-gray-500">Paso 1</div>
                        <div class="text-lg font-semibold">Bandeja Operativa</div>
                        <div class="text-sm text-gray-500">Recepción, clasificación y priorización.</div>
                    </button>

                    <button
                        wire:click="cambiarEtapa('revision')"
                        class="rounded-2xl border p-4 text-left transition
                            {{ $etapa === 'revision' ? 'border-warning-500 bg-warning-50 shadow-sm' : 'border-gray-200 bg-white hover:bg-gray-50' }}"
                    >
                        <div class="text-sm text-gray-500">Paso 2</div>
                        <div class="text-lg font-semibold">Revisión Operativa</div>
                        <div class="text-sm text-gray-500">Validación técnica y derivación.</div>
                    </button>

                    <button
                        wire:click="cambiarEtapa('aprobaciones')"
                        class="rounded-2xl border p-4 text-left transition
                            {{ $etapa === 'aprobaciones' ? 'border-success-500 bg-success-50 shadow-sm' : 'border-gray-200 bg-white hover:bg-gray-50' }}"
                    >
                        <div class="text-sm text-gray-500">Paso 3</div>
                        <div class="text-lg font-semibold">Aprobaciones</div>
                        <div class="text-sm text-gray-500">Resolución administrativa final.</div>
                    </button>
                </div>

                <div class="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
                    <strong>Etapa actual:</strong> {{ $this->etapaLabel() }}
                </div>
            </div>
        </x-filament::section>

        {{ $this->form }}

        <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
            <x-filament::section>
                <div class="text-sm text-gray-500">Total</div>
                <div class="text-2xl font-semibold">{{ $kpi_total }}</div>
            </x-filament::section>

            <x-filament::section>
                <div class="text-sm text-gray-500">{{ $kpi_a_label }}</div>
                <div class="text-2xl font-semibold">{{ $kpi_a }}</div>
            </x-filament::section>

            <x-filament::section>
                <div class="text-sm text-gray-500">{{ $kpi_b_label }}</div>
                <div class="text-2xl font-semibold">{{ $kpi_b }}</div>
            </x-filament::section>

            <x-filament::section>
                <div class="text-sm text-gray-500">{{ $kpi_c_label }}</div>
                <div class="text-2xl font-semibold">{{ $kpi_c }}</div>
            </x-filament::section>
        </div>

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
                            <th class="py-3 pr-4">Estado</th>
                            <th class="py-3 pr-4">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse ($this->paginatedRows as $row)
                            <tr class="border-b align-top">
                                <td class="py-3 pr-4">
                                    <span class="fi-badge fi-color-gray">{{ ucfirst($row['tipo']) }}</span>
                                </td>
                                <td class="py-3 pr-4 font-mono">{{ $row['codigo'] }}</td>
                                <td class="py-3 pr-4">
                                    {{ $row['fecha_ingreso'] ? \Carbon\Carbon::parse($row['fecha_ingreso'])->format('d/m/Y H:i') : '—' }}
                                </td>
                                <td class="py-3 pr-4">{{ $row['solicitante'] }}</td>
                                <td class="py-3 pr-4">{{ $row['unidad'] }}</td>
                                <td class="py-3 pr-4">{{ $row['detalle'] }}</td>
                                <td class="py-3 pr-4">{{ strtoupper($row['prioridad']) }}</td>
                                <td class="py-3 pr-4">
                                    <span class="fi-badge fi-color-gray">
                                        {{ ucfirst(str_replace('_', ' ', $row['estado'])) }}
                                    </span>
                                </td>
                                <td class="py-3 pr-4">
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

                                            <div class="flex gap-2">
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
                                        <div class="flex flex-wrap gap-2">
                                            <x-filament::modal width="2xl">
                                                <x-slot name="trigger">
                                                    <x-filament::button size="sm" color="gray">
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
                                                    <x-filament::button size="sm" color="warning">
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

                                            <x-filament::modal width="2xl">
                                                <x-slot name="trigger">
                                                    <x-filament::button size="sm" color="success">
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
                                        </div>
                                    @endif

                                    @if($etapa === 'aprobaciones')
                                        <div class="flex flex-wrap gap-2">
                                            <x-filament::modal width="xl">
                                                <x-slot name="trigger">
                                                    <x-filament::button size="sm" color="success">Aprobar</x-filament::button>
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

                                            <x-filament::modal width="xl">
                                                <x-slot name="trigger">
                                                    <x-filament::button size="sm" color="danger">Rechazar</x-filament::button>
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
                                                    <x-filament::button size="sm" color="warning">Condicionar</x-filament::button>
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
                                                    <x-filament::button size="sm" color="gray">Reabrir</x-filament::button>
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
                                    @endif
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="9" class="py-6 text-center text-gray-500">
                                    No hay solicitudes para esta etapa.
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