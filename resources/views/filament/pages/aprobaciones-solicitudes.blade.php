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
                                        <x-filament::modal width="xl">
                                            <x-slot name="trigger">
                                                <x-filament::button size="sm" color="success">
                                                    Aprobar
                                                </x-filament::button>
                                            </x-slot>

                                            <x-slot name="heading">Aprobar solicitud</x-slot>

                                            <form wire:submit.prevent="aprobar('{{ $row['tipo'] }}', {{ $row['id'] }}, {
                                                comentario: $refs.aprobarComentario{{ $row['tipo'] }}{{ $row['id'] }}.value
                                            })" class="space-y-4">
                                                <textarea
                                                    x-ref="aprobarComentario{{ $row['tipo'] }}{{ $row['id'] }}"
                                                    class="w-full rounded-lg border-gray-300"
                                                    rows="4"
                                                    placeholder="Comentario de aprobación"
                                                    required
                                                ></textarea>

                                                <div class="flex justify-end">
                                                    <x-filament::button type="submit" color="success">
                                                        Confirmar aprobación
                                                    </x-filament::button>
                                                </div>
                                            </form>
                                        </x-filament::modal>

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