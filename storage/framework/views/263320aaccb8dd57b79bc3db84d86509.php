<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Reporte Solicitudes de Transporte</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; }
        h2 { margin: 0 0 8px 0; }
        .meta { margin-bottom: 12px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ccc; padding: 6px; vertical-align: top; }
        th { background: #f2f2f2; }
    </style>
</head>
<body>
    <h2>Reporte de Solicitudes de Transporte</h2>

    <div class="meta">
        <div><strong>Rango:</strong> <?php echo e($rangeLabel); ?></div>
        <div><strong>Generado:</strong> <?php echo e(now()->format('d/m/Y H:i')); ?></div>
        <div><strong>Total:</strong> <?php echo e($rows->count()); ?></div>
    </div>

    <table>
        <thead>
        <tr>
            <th>Código</th>
            <th>Unidad</th>
            <th>Solicitante</th>
            <th>Salida</th>
            <th>Origen</th>
            <th>Destino</th>
            <th>Prioridad</th>
            <th>Estado</th>
        </tr>
        </thead>
        <tbody>
        <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__currentLoopData = $rows; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $r): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
    <tr>
        <td><?php echo e($r->codigo); ?></td>
        <td><?php echo e($r->unidad?->nombre ?? 'N/A'); ?></td>
        <td><?php echo e($r->solicitante?->name ?? 'N/A'); ?></td>
        <td><?php echo e($r->fecha_salida ? $r->fecha_salida->format('d/m/Y H:i') : 'N/A'); ?></td>
        <td><?php echo e($r->origen); ?></td>
        <td><?php echo e($r->destino); ?></td>
        
        <td><?php echo e(strtoupper($r->prioridad instanceof \App\Domain\Solicitudes\Enums\PrioridadSolicitudEnum ? $r->prioridad->value : $r->prioridad)); ?></td>
        <td><?php echo e($r->estado instanceof \App\Domain\Solicitudes\Enums\EstadoSolicitudEnum ? $r->estado->value : $r->estado); ?></td>
    </tr>
<?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
        </tbody>
    </table>
</body>
</html>
<?php /**PATH C:\Users\steve\transporte-asamblea01\resources\views\reports\solicitudes_transporte_pdf.blade.php ENDPATH**/ ?>