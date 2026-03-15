@php
    $record = $getRecord();
    $solicitudActiva = $record->solicitudes->first();
    $motorista = $record->asignacionVigenteMotorista?->motorista;
    
    $status = match(true) {
        $solicitudActiva?->estado === \App\Domain\Solicitudes\Enums\EstadoSolicitudEnum::EN_EJECUCION => [
            'label' => 'En Ejecución',
            'color' => 'danger',
            'icon' => 'heroicon-m-play-circle',
            'bg' => 'bg-danger-500/10'
        ],
        $solicitudActiva?->estado === \App\Domain\Solicitudes\Enums\EstadoSolicitudEnum::PROGRAMADA => [
            'label' => 'Programado',
            'color' => 'warning',
            'icon' => 'heroicon-m-calendar',
            'bg' => 'bg-warning-500/10'
        ],
        default => [
            'label' => 'Disponible',
            'color' => 'success',
            'icon' => 'heroicon-m-check-circle',
            'bg' => 'bg-success-500/10'
        ],
    };
@endphp

<div class="p-4 space-y-4">
    <div class="flex items-start justify-between">
        <div class="flex items-center gap-3">
            <div class="flex flex-col">
                <span class="font-mono text-lg font-bold tracking-wider text-gray-950 dark:text-white">
                    {{ $record->placa }}
                </span>
                <span class="text-xs text-gray-500 italic">{{ $record->tipo?->nombre }}</span>
            </div>
        </div>
        <div @class([
            'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border',
            "text-{$status['color']}-600 border-{$status['color']}-600/20 {$status['bg']}"
        ])>
            <x-filament::icon :icon="$status['icon']" class="h-3.5 w-3.5" />
            {{ $status['label'] }}
        </div>
    </div>

    <div class="grid grid-cols-2 gap-4 py-3 border-y border-gray-100 dark:border-white/10 text-sm">
        <div>
            <p class="text-[10px] uppercase font-bold text-gray-400">Marca / Modelo</p>
            <p class="font-medium text-gray-700 dark:text-gray-300">
                {{ $record->marca?->nombre }} {{ $record->modelo?->nombre }}
            </p>
        </div>
        <div>
            <p class="text-[10px] uppercase font-bold text-gray-400">Capacidad</p>
            <p class="font-medium text-gray-700 dark:text-gray-300">👥 {{ $record->capacidad_personas }} pers.</p>
        </div>
    </div>

    <div @class([
        'flex items-center gap-3 p-2 rounded-lg border border-dashed transition-colors',
        $motorista ? 'bg-primary-50/50 border-primary-200 dark:bg-primary-500/5 dark:border-primary-500/20' : 'bg-gray-50 border-gray-200 dark:bg-white/5 dark:border-white/10'
    ])>
        <div class="h-8 w-8 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm border border-gray-100 dark:border-white/10">
            <x-filament::icon icon="heroicon-m-user" class="h-4 w-4 text-gray-400" />
        </div>
        <div class="flex-1 min-w-0">
            <p class="text-[10px] uppercase font-bold text-gray-400 leading-none mb-1">Motorista Fijo</p>
            <p class="text-xs font-semibold truncate {{ $motorista ? 'text-primary-700 dark:text-primary-400' : 'text-gray-500' }}">
                {{ $motorista?->nombre ?? 'Sin asignar' }}
            </p>
        </div>
    </div>

    @if($solicitudActiva)
        <div class="space-y-2">
            <div class="flex items-center justify-between text-[10px] uppercase font-bold text-gray-400">
                <span>{{ $status['label'] === 'En Ejecución' ? '📍 Destino Actual' : '📅 Próxima Salida' }}</span>
                <span class="font-mono">{{ $solicitudActiva->codigo }}</span>
            </div>
            <div class="text-sm font-medium bg-gray-50 dark:bg-white/5 p-2.5 rounded-lg border border-gray-100 dark:border-white/10">
                <div class="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                    <span class="truncate">{{ $solicitudActiva->destino }}</span>
                </div>
                <div class="mt-1 text-xs text-gray-500 flex items-center gap-1">
                    <x-filament::icon icon="heroicon-m-clock" class="h-3 w-3" />
                    {{ $solicitudActiva->fecha_salida->format('d M, H:i') }}
                </div>
            </div>
        </div>
    @else
        <div class="flex items-center justify-center py-4 bg-success-50/30 rounded-lg border border-success-100 dark:bg-success-500/5 dark:border-success-500/10">
            <span class="text-xs font-medium text-success-700 dark:text-success-400">Listo para nueva asignación</span>
        </div>
    @endif
</div>