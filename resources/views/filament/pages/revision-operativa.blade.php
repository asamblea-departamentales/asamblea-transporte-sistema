<x-filament-panels::page>
    <div class="space-y-6">

        {{ $this->form }}

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
                                        <x-filament::modal width="2xl">
                                            <x-slot name="trigger">
                                                <x-filament::button size="sm" color="gray">
                                                    Observar
                                                </x-filament::button>
                                            </x-slot>

                                            <x-slot name="heading">Observación de revisión operativa</x-slot>

                                            <form wire:submit.prevent="observar('{{ $row['tipo'] }}', {{ $row['id'] }}, {
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
                                                <x-filament::button size="sm">
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
                                                    <label><input type="checkbox" x-ref="datosVal{{ $row['tipo'] }}{{ $row['id'] }}" required> Datos completos</label>
                                                    <label><input type="checkbox" x-ref="fechasVal{{ $row['tipo'] }}{{ $row['id'] }}" required> Fechas válidas</label>
                                                    <label><input type="checkbox" x-ref="recursosVal{{ $row['tipo'] }}{{ $row['id'] }}"> Recursos disponibles</label>
                                                    <label><input type="checkbox" x-ref="reglasVal{{ $row['tipo'] }}{{ $row['id'] }}" required> Reglas mínimas</label>
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
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="8" class="py-6 text-center text-gray-500">
                                    No hay solicitudes en revisión operativa.
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