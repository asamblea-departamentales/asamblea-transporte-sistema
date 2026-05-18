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
            // 1. Eliminar la clave foránea que amarra al índice original
            // Nota: Si el nombre automático es diferente, usa: 'asignaciones_combustibles_lote_detalles_vehiculo_id_foreign'
            $table->dropForeign(['vehiculo_id']);

            // 2. Ahora ya puedes borrar el índice único sin bloqueos de MySQL
            $table->dropUnique('lote_detalle_vehiculo_unique');

            // 3. Crear el nuevo índice único
            $table->unique(['lote_id', 'solicitud_combustible_id'], 'lote_detalle_solicitud_unique');

            // Campos operativos nuevos
            $table->foreignId('asignado_por')->nullable()
                ->after('solicitud_combustible_id')
                ->constrained('users')->nullOnDelete();

            $table->timestamp('fecha_asignacion')->nullable()->after('asignado_por');

            $table->string('numero_serie', 100)->nullable()->after('fecha_asignacion');
            $table->string('numero_contrato', 100)->nullable()->after('numero_serie');

            $table->foreignId('tipo_combustible_id')->nullable()
                ->after('numero_contrato')
                ->constrained('tipo_combustibles')->nullOnDelete();

            $table->decimal('cantidad_galones', 10, 2)->nullable()->after('tipo_combustible_id');

            $table->string('estado_asignacion', 20)->default('pendiente')->after('cantidad_galones');

            $table->text('observaciones_operativas')->nullable()->after('estado_asignacion');
        });
    }

    public function down(): void
    {
        Schema::table('asignaciones_combustibles_lote_detalles', function (Blueprint $table) {
            // Eliminar llaves foráneas creadas en el up()
            $table->dropForeign(['asignado_por']);
            $table->dropForeign(['tipo_combustible_id']);
            
            // Revertir el índice único nuevo
            $table->dropUnique('lote_detalle_solicitud_unique');

            // Revertir el índice único original y re-enlazar su FK
            $table->unique(['lote_id', 'vehiculo_id'], 'lote_detalle_vehiculo_unique');
            $table->foreign('vehiculo_id')->references('id')->on('vehiculos'); // Ajusta tu tabla destino si no es 'vehiculos'

            // Eliminar las columnas creadas
            $table->dropColumn([
                'asignado_por', 'fecha_asignacion', 'numero_serie',
                'numero_contrato', 'tipo_combustible_id', 'cantidad_galones',
                'estado_asignacion', 'observaciones_operativas',
            ]);
        });
    }
};
