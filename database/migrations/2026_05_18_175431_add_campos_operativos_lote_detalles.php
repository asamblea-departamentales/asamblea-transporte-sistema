<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('asignaciones_combustibles_lote_detalles', function (Blueprint $table) {
            
            // 1. Eliminar la FK que está amarrada al índice único viejo
            $table->dropForeign('asignaciones_combustibles_lote_detalles_lote_id_foreign');

            // 2. Ahora MySQL te dejará borrar el índice único viejo libremente
            $table->dropUnique('lote_detalle_vehiculo_unique');

            // 3. Crear el nuevo índice único
            $table->unique(
                ['lote_id', 'solicitud_combustible_id'],
                'lote_detalle_solicitud_unique'
            );

            // 4. Volver a crear la FK de lote_id (vuelve a la normalidad con cascada)
            $table->foreign('lote_id')
                ->references('id')
                ->on('asignaciones_combustibles_lotes')
                ->onDelete('cascade');

            // --- Campos operativos adicionales ---
            $table->foreignId('asignado_por')
                ->nullable()
                ->after('solicitud_combustible_id')
                ->constrained('users')
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
                ->constrained('tipo_combustibles')
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

            $table->dropForeign(['asignado_por']);
            $table->dropForeign(['tipo_combustible_id']);
            
            // El proceso inverso para el método down
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