<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('asignaciones_combustibles_lote_detalles', function (Blueprint $table) {

            // ─────────────────────────────────────────────────────────────
            // FIX UNIQUE CONSTRAINT
            // Antes:
            // unique(lote_id, vehiculo_id)
            //
            // Nuevo:
            // unique(lote_id, solicitud_combustible_id)
            // ─────────────────────────────────────────────────────────────

            // eliminar FK que usa el índice actual
            $table->dropForeign(['vehiculo_id']);

            // eliminar índice unique viejo
            $table->dropUnique('lote_detalle_vehiculo_unique');

            // restaurar FK
            $table->foreign('vehiculo_id')
                ->references('id')
                ->on('vehiculos')
                ->cascadeOnDelete();

            // nuevo unique
            $table->unique(
                ['lote_id', 'solicitud_combustible_id'],
                'lote_detalle_solicitud_unique'
            );

            // ─────────────────────────────────────────────────────────────
            // CAMPOS OPERATIVOS
            // ─────────────────────────────────────────────────────────────

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

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('asignaciones_combustibles_lote_detalles', function (Blueprint $table) {

            // ─────────────────────────────────────────────────────────────
            // ELIMINAR FOREIGN KEYS NUEVAS
            // ─────────────────────────────────────────────────────────────

            $table->dropForeign(['asignado_por']);
            $table->dropForeign(['tipo_combustible_id']);

            // ─────────────────────────────────────────────────────────────
            // REVERTIR UNIQUE
            // ─────────────────────────────────────────────────────────────

            // eliminar FK antes de restaurar índice anterior
            $table->dropForeign(['vehiculo_id']);

            // eliminar unique nuevo
            $table->dropUnique('lote_detalle_solicitud_unique');

            // restaurar unique anterior
            $table->unique(
                ['lote_id', 'vehiculo_id'],
                'lote_detalle_vehiculo_unique'
            );

            // restaurar FK
            $table->foreign('vehiculo_id')
                ->references('id')
                ->on('vehiculos')
                ->cascadeOnDelete();

            // ─────────────────────────────────────────────────────────────
            // ELIMINAR CAMPOS OPERATIVOS
            // ─────────────────────────────────────────────────────────────

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