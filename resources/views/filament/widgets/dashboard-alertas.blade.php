<x-filament-widgets::widget>
    <x-filament::section>
        <x-slot name="heading">Alertas</x-slot>

        @php $d = $this->getData(); @endphp

        <div class="flex flex-col gap-3">
            <div class="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <div class="shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400">
                    <x-heroicon-m-exclamation-triangle class="w-5 h-5" />
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-xs text-red-600 dark:text-red-400 font-medium">Incidencias abiertas</p>
                    <p class="text-2xl font-bold text-red-700 dark:text-red-300 leading-none mt-0.5">{{ $d['incidencias'] }}</p>
                </div>
            </div>

            <div class="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
                <div class="shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400">
                    <x-heroicon-m-document-minus class="w-5 h-5" />
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-xs text-yellow-600 dark:text-yellow-400 font-medium">Sin comprobantes</p>
                    <p class="text-2xl font-bold text-yellow-700 dark:text-yellow-300 leading-none mt-0.5">{{ $d['sinComprobantes'] }}</p>
                </div>
            </div>
        </div>

    </x-filament::section>
</x-filament-widgets::widget>