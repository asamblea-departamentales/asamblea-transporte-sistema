<x-filament::widget>
    <div class="bg-white p-4 rounded-xl shadow">
        <div class="text-sm font-bold mb-3">Actividad reciente</div>

        @foreach($this->getData() as $item)
            <div class="flex justify-between text-xs py-2 border-b">
                <span>{{ $item->codigo }}</span>
                <span>{{ $item->created_at->format('d/m/Y') }}</span>
            </div>
        @endforeach
    </div>
</x-filament::widget>