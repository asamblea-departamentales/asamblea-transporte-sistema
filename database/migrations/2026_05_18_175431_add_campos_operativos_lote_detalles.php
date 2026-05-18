<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('asignaciones_combustibles_lote_detalles', function (Blueprint $table) {

            // eliminar unique viejo
            $table->dropUnique('lote_detalle_vehiculo_unique');

            // nuevo unique
            $table->unique(
                ['lote_id', 'solicitud_combustible_id'],
                'lote_detalle_solicitud_unique'
            );

            // Campos operativos
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

            $table->dropUnique('lote_detalle_solicitud_unique');

            $table->unique(
                ['lote_id', 'vehiculo_id'],
                'lote_detalle_vehiculo_unique'
            );

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