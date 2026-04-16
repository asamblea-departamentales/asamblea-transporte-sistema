<x-filament-widgets::widget>
    <x-filament::section>
        <x-slot name="heading">Costos del período</x-slot>

        @php $d = $this->getData(); @endphp

        <div class="flex flex-col gap-3">
            <div class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full bg-green-500"></div>
                    <span class="text-xs text-gray-500 dark:text-gray-400">Combustible</span>
                </div>
                <span class="text-sm font-bold text-gray-900 dark:text-white">
                    ${{ number_format($d['combustible'], 2) }}
                </span>
            </div>

            <div class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full bg-orange-500"></div>
                    <span class="text-xs text-gray-500 dark:text-gray-400">Mantenimiento</span>
                </div>
                <span class="text-sm font-bold text-gray-900 dark:text-white">
                    ${{ number_format($d['mantenimiento'], 2) }}
                </span>
            </div>

            <div class="flex items-center justify-between py-2.5 px-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl mt-1">
                <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full bg-indigo-500"></div>
                    <span class="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Total sistema</span>
                </div>
                <span class="text-sm font-bold text-indigo-700 dark:text-indigo-300">
                    ${{ number_format($d['total'], 2) }}
                </span>
            </div>
        </div>

    </x-filament::section>
</x-filament-widgets::widget>