<?php if (isset($component)) { $__componentOriginald489e48d6214ecaf87e4b6a8ce684ad1 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginald489e48d6214ecaf87e4b6a8ce684ad1 = $attributes; } ?>
<?php $component = Filament\View\LegacyComponents\Widget::resolve([] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('filament::widget'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Filament\View\LegacyComponents\Widget::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
    <?php ($d = $this->getData()); ?>

    <div class="grid grid-cols-3 gap-4">
        <div class="p-4 bg-white rounded-xl shadow">
            <div class="text-xs text-gray-500">Combustible</div>
            <div class="text-xl font-bold">$<?php echo e(number_format($d['combustible'], 2)); ?></div>
        </div>

        <div class="p-4 bg-white rounded-xl shadow">
            <div class="text-xs text-gray-500">Mantenimiento</div>
            <div class="text-xl font-bold">$<?php echo e(number_format($d['mantenimiento'], 2)); ?></div>
        </div>

        <div class="p-4 bg-white rounded-xl shadow border-2 border-indigo-500">
            <div class="text-xs text-gray-500">Total sistema</div>
            <div class="text-xl font-bold">$<?php echo e(number_format($d['total'], 2)); ?></div>
        </div>
    </div>
 <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginald489e48d6214ecaf87e4b6a8ce684ad1)): ?>
<?php $attributes = $__attributesOriginald489e48d6214ecaf87e4b6a8ce684ad1; ?>
<?php unset($__attributesOriginald489e48d6214ecaf87e4b6a8ce684ad1); ?>
<?php endif; ?>
<?php if (isset($__componentOriginald489e48d6214ecaf87e4b6a8ce684ad1)): ?>
<?php $component = $__componentOriginald489e48d6214ecaf87e4b6a8ce684ad1; ?>
<?php unset($__componentOriginald489e48d6214ecaf87e4b6a8ce684ad1); ?>
<?php endif; ?><?php /**PATH C:\Users\steve\transporte-asamblea01\resources\views/filament/widgets/dashboard-finanzas.blade.php ENDPATH**/ ?>