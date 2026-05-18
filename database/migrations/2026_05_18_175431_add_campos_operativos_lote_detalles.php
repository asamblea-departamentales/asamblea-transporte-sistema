<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Limpieza segura del índice viejo si aún existiera
        Schema::table('asignaciones_combustibles_lote_detalles', function (Blueprint $table) {
            $sm = Schema::getManager();
            $doctrineTable = $sm->introspectTable('asignaciones_combustibles_lote_detalles');
            
            // Si la FK todavía existe de milagro, la borramos
            if ($doctrineTable->hasForeignKey('asignaciones_combustibles_lote_detalles_lote_id_foreign')) {
                $table->dropForeign('asignaciones_combustibles_lote_detalles_lote_id_foreign');
            }
            
            // Si el índice único todavía existe, lo borramos
            if ($doctrineTable->hasIndex('lote_detalle_vehiculo_unique')) {
                $table->dropUnique('lote_detalle_vehiculo_unique');
            }
        });

        // 2. Ejecutar el resto de la migración con normalidad
        Schema::table('asignaciones_combustibles_lote_detalles', function (Blueprint $table) {
            
            // Crear el nuevo índice único (solo si no se creó antes)
            // Para ir sobre seguro usando MySQL nativo sin fallar si ya existe:
            // Laravel tirará error si ya existe, así que nos aseguramos de crearlo limpiamente:
            $sm = Schema::getManager();
            $doctrineTable = $sm->introspectTable('asignaciones_combustibles_lote_detalles');

            if (!$doctrineTable->hasIndex('lote_detalle_solicitud_unique')) {
                $table->unique(
                    ['lote_id', 'solicitud_combustible_id'],
                    'lote_detalle_solicitud_unique'
                );
            }

            // Volver a vincular la FK de lote_id si se había borrado
            if (!$doctrineTable->hasForeignKey('asignaciones_combustibles_lote_detalles_lote_id_foreign')) {
                $table->foreign('lote_id')
                    ->references('id')
                    ->on('asignaciones_combustibles_lotes')
                    ->onDelete('cascade');
            }

            // --- Campos operativos adicionales ---
            $table->foreignId('asignado_por')
                ->nullable()
                ->after('solicitud_combustible_id')
                ->constrained('users', indexName: 'lote_detalles_asignado_por_fk')
                ->nullOnDelete();

            $table->timestamp('fecha_asignacion')
                ->nullable()
                ->after('asignado_por');

            $table->string('numero_serie', 100)
                ->nullable()
                ->after('fecha_asignacion');

            $table->string('numero_contrato', 100)
                ->nullable()
                ->after('numero_serie');

            $table->foreignId('tipo_combustible_id')
                ->nullable()
                ->after('numero_contrato')
                ->constrained('tipo_combustibles', indexName: 'lote_detalles_tipo_comb_fk')
                ->nullOnDelete();

            $table->decimal('cantidad_galones', 10, 2)
                ->nullable()
                ->after('tipo_combustible_id');

            $table->string('estado_asignacion', 20)
                ->default('pendiente')
                ->after('cantidad_galones');

            $table->text('observaciones_operativas')
                ->nullable()
                ->after('estado_asignacion');
        });
    }

    public function down(): void
    {
        Schema::table('asignaciones_combustibles_lote_detalles', function (Blueprint $table) {
            $table->dropForeign('lote_detalles_asignado_por_fk');
            $table->dropForeign('lote_detalles_tipo_comb_fk');
            
            $table->dropForeign('asignaciones_combustibles_lote_detalles_lote_id_foreign');
            $table->dropUnique('lote_detalle_solicitud_unique');

            $table->unique(
                ['lote_id', 'vehiculo_id'],
                'lote_detalle_vehiculo_unique'
            );

            $table->foreign('lote_id')
                ->references('id')
                ->on('asignaciones_combustibles_lotes')
                ->onDelete('cascade');

            $table->dropColumn([
                'asignado_por',
                'fecha_asignacion',
                'numero_serie',
                'numero_contrato',
                'tipo_combustible_id',
                'cantidad_galones',
                'estado_asignacion',
                'observaciones_operativas',
            ]);
        });
    }
};