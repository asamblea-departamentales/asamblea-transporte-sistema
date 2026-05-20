<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * MIGRACIÓN CORREGIDA Y MODERNIZADA
     * 
     * Problemas solucionados:
     * 1. Schema::getManager() → Schema::getForeignKeys() / Schema::getIndexes()
     * 2. 'tipo_combustibles' → 'veh_tipo_combustible' (tabla correcta)
     * 3. Agregados validaciones con hasColumn/hasForeignKey para idempotencia
     */

    public function up(): void
    {
        Schema::table('asignaciones_combustibles_lote_detalles', function (Blueprint $table) {
            
            // ─────────────────────────────────────────────────────────────────
            // PASO 1: Limpiar constraints viejos de forma segura (Laravel 11+)
            // ─────────────────────────────────────────────────────────────────
            
            // Obtener lista de FKs existentes (método nativo Laravel)
            $foreignKeys = collect(Schema::getForeignKeys('asignaciones_combustibles_lote_detalles'))
                ->pluck('name')
                ->toArray();

            // Obtener lista de índices existentes (método nativo Laravel)
            $indexes = collect(Schema::getIndexes('asignaciones_combustibles_lote_detalles'))
                ->pluck('name')
                ->toArray();

            // Eliminar FK lote_id antigua si existe
            if (in_array('asignaciones_combustibles_lote_detalles_lote_id_foreign', $foreignKeys)) {
                $table->dropForeign('asignaciones_combustibles_lote_detalles_lote_id_foreign');
            }

            // Eliminar UNIQUE constraint viejo si existe
            if (in_array('lote_detalle_vehiculo_unique', $indexes)) {
                $table->dropUnique('lote_detalle_vehiculo_unique');
            }
        });

        Schema::table('asignaciones_combustibles_lote_detalles', function (Blueprint $table) {
            
            // ─────────────────────────────────────────────────────────────────
            // PASO 2: Crear nuevo UNIQUE constraint (idempotente)
            // ─────────────────────────────────────────────────────────────────
            
            $indexes = collect(Schema::getIndexes('asignaciones_combustibles_lote_detalles'))
                ->pluck('name')
                ->toArray();

            if (!in_array('lote_detalle_solicitud_unique', $indexes)) {
                $table->unique(
                    ['lote_id', 'solicitud_combustible_id'],
                    'lote_detalle_solicitud_unique'
                );
            }

            // ─────────────────────────────────────────────────────────────────
            // PASO 3: Recrear FK lote_id (idempotente)
            // ─────────────────────────────────────────────────────────────────
            
            $foreignKeys = collect(Schema::getForeignKeys('asignaciones_combustibles_lote_detalles'))
                ->pluck('name')
                ->toArray();

            if (!in_array('asignaciones_combustibles_lote_detalles_lote_id_foreign', $foreignKeys)) {
                $table->foreign('lote_id')
                    ->references('id')
                    ->on('asignaciones_combustibles_lotes')
                    ->onDelete('cascade');
            }

            // ─────────────────────────────────────────────────────────────────
            // PASO 4: Agregar campos operativos (idempotente)
            // ─────────────────────────────────────────────────────────────────

            // asignado_por
            if (!Schema::hasColumn('asignaciones_combustibles_lote_detalles', 'asignado_por')) {
                $table->foreignId('asignado_por')
                    ->nullable()
                    ->after('solicitud_combustible_id')
                    ->constrained('users', indexName: 'lote_detalles_asignado_por_fk')
                    ->nullOnDelete();
            }

            // fecha_asignacion
            if (!Schema::hasColumn('asignaciones_combustibles_lote_detalles', 'fecha_asignacion')) {
                $table->timestamp('fecha_asignacion')
                    ->nullable()
                    ->after('asignado_por');
            }

            // numero_serie
            if (!Schema::hasColumn('asignaciones_combustibles_lote_detalles', 'numero_serie')) {
                $table->string('numero_serie', 100)
                    ->nullable()
                    ->after('fecha_asignacion');
            }

            // numero_contrato
            if (!Schema::hasColumn('asignaciones_combustibles_lote_detalles', 'numero_contrato')) {
                $table->string('numero_contrato', 100)
                    ->nullable()
                    ->after('numero_serie');
            }

            // tipo_combustible_id (CORREGIDO: veh_tipo_combustible, no tipo_combustibles)
            if (!Schema::hasColumn('asignaciones_combustibles_lote_detalles', 'tipo_combustible_id')) {
                $table->foreignId('tipo_combustible_id')
                    ->nullable()
                    ->after('numero_contrato')
                    ->constrained('veh_tipo_combustible', 'id', indexName: 'lote_detalles_tipo_comb_fk')
                    ->nullOnDelete();
            }

            // cantidad_galones
            if (!Schema::hasColumn('asignaciones_combustibles_lote_detalles', 'cantidad_galones')) {
                $table->decimal('cantidad_galones', 10, 2)
                    ->nullable()
                    ->after('tipo_combustible_id');
            }

            // estado_asignacion
            if (!Schema::hasColumn('asignaciones_combustibles_lote_detalles', 'estado_asignacion')) {
                $table->string('estado_asignacion', 20)
                    ->default('pendiente')
                    ->after('cantidad_galones');
            }

            // observaciones_operativas
            if (!Schema::hasColumn('asignaciones_combustibles_lote_detalles', 'observaciones_operativas')) {
                $table->text('observaciones_operativas')
                    ->nullable()
                    ->after('estado_asignacion');
            }
        });
    }

    public function down(): void
    {
        Schema::table('asignaciones_combustibles_lote_detalles', function (Blueprint $table) {
            
            // Obtener FKs actuales de forma segura
            $foreignKeys = collect(Schema::getForeignKeys('asignaciones_combustibles_lote_detalles'))
                ->pluck('name')
                ->toArray();

            // Eliminar FKs nuevas si existen
            if (in_array('lote_detalles_asignado_por_fk', $foreignKeys)) {
                $table->dropForeign('lote_detalles_asignado_por_fk');
            }

            if (in_array('lote_detalles_tipo_comb_fk', $foreignKeys)) {
                $table->dropForeign('lote_detalles_tipo_comb_fk');
            }

            // Obtener índices actuales
            $indexes = collect(Schema::getIndexes('asignaciones_combustibles_lote_detalles'))
                ->pluck('name')
                ->toArray();

            // Eliminar UNIQUE nuevo si existe
            if (in_array('lote_detalle_solicitud_unique', $indexes)) {
                $table->dropUnique('lote_detalle_solicitud_unique');
            }

            // Eliminar FK lote_id si existe
            if (in_array('asignaciones_combustibles_lote_detalles_lote_id_foreign', $foreignKeys)) {
                $table->dropForeign('asignaciones_combustibles_lote_detalles_lote_id_foreign');
            }

            // Recrear los viejos constraints
            if (!in_array('lote_detalle_vehiculo_unique', $indexes)) {
                $table->unique(
                    ['lote_id', 'vehiculo_id'],
                    'lote_detalle_vehiculo_unique'
                );
            }

            if (!in_array('asignaciones_combustibles_lote_detalles_lote_id_foreign', $foreignKeys)) {
                $table->foreign('lote_id')
                    ->references('id')
                    ->on('asignaciones_combustibles_lotes')
                    ->onDelete('cascade');
            }

            // Eliminar columnas nuevas (idempotente)
            $columns = Schema::getColumnListing('asignaciones_combustibles_lote_detalles');

            $columnsToRemove = [
                'asignado_por',
                'fecha_asignacion',
                'numero_serie',
                'numero_contrato',
                'tipo_combustible_id',
                'cantidad_galones',
                'estado_asignacion',
                'observaciones_operativas',
            ];

            $existingColumns = array_intersect($columnsToRemove, $columns);

            if (!empty($existingColumns)) {
                $table->dropColumn($existingColumns);
            }
        });
    }
};
