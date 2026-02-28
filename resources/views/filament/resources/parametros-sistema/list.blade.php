<x-filament-panels::page>
    <div class="space-y-4">
        @foreach ($parametros as $param)
            <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                <div class="flex items-start justify-between gap-4">

                    {{-- Info --}}
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="text-xs font-mono bg-gray-100 dark:bg-gray-900 text-primary-600 dark:text-primary-400 px-2 py-0.5 rounded">
                                {{ $param['codigo'] }}
                            </span>
                            <span class="text-xs text-gray-400">{{ $param['tipo'] }}</span>
                        </div>
                        <p class="text-sm font-semibold text-gray-900 dark:text-white">
                            {{ $param['nombre'] }}
                        </p>

                        {{-- Valor editable o solo lectura --}}
                        @if (isset($editando[$param['id']]))
                            <div class="mt-2 flex items-center gap-2">
                                <input
                                    type="text"
                                    wire:model="editando.{{ $param['id'] }}"
                                    class="flex-1 text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white px-3 py-1.5 focus:ring-2 focus:ring-primary-500"
                                />
                                <button
                                    wire:click="guardar({{ $param['id'] }})"
                                    class="text-xs bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded-lg font-medium"
                                >
                                    Guardar
                                </button>
                                <button
                                    wire:click="cancelar({{ $param['id'] }})"
                                    class="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg font-medium"
                                >
                                    Cancelar
                                </button>
                            </div>
                        @else
                            <p class="mt-1 text-sm text-gray-600 dark:text-gray-300 font-mono break-all">
                                {{ $param['valor'] ?? '— sin valor —' }}
                            </p>
                            @if ($param['valor_default'])
                                <p class="text-xs text-gray-400 mt-0.5">
                                    Default: {{ $param['valor_default'] }}
                                </p>
                            @endif
                        @endif
                    </div>

                    {{-- Botón Editar --}}
                    @unless (isset($editando[$param['id']]))
                        <button
                            wire:click="editar({{ $param['id'] }})"
                            class="shrink-0 text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium flex items-center gap-1"
                        >
                            <x-heroicon-m-pencil class="w-3.5 h-3.5" />
                            Editar
                        </button>
                    @endunless
                </div>
            </div>
        @endforeach
    </div>
</x-filament-panels::page>