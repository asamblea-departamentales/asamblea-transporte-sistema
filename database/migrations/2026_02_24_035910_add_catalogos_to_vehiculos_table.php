<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vehiculos', function (Blueprint $table) {
            $table->foreignId('veh_marca_id')->nullable()->after('tipo_vehiculo_id')->constrained('veh_marcas');
            $table->foreignId('veh_modelo_id')->nullable()->after('veh_marca_id')->constrained('veh_modelos');
            $table->foreignId('veh_color_id')->nullable()->after('veh_modelo_id')->constrained('veh_colores');
            $table->foreignId('veh_tipo_motor_id')->nullable()->after('veh_color_id')->constrained('veh_tipos_motor');
            $table->foreignId('veh_transmision_id')->nullable()->after('veh_tipo_motor_id')->constrained('veh_transmisiones');
            $table->foreignId('veh_traccion_id')->nullable()->after('veh_transmision_id')->constrained('veh_tracciones');
            $table->foreignId('veh_tipo_llanta_id')->nullable()->after('veh_traccion_id')->constrained('veh_tipo_llantas');
            $table->foreignId('veh_tipo_combustible_id')->nullable()->after('veh_tipo_llanta_id')->constrained('veh_tipo_combustible');
            $table->foreignId('veh_clasificacion_id')->nullable()->after('veh_tipo_combustible_id')->constrained('veh_clasificaciones');
            $table->foreignId('veh_estado_catalogo_id')->nullable()->after('veh_clasificacion_id')->constrained('veh_estados_catalogo');

            $table->unsignedSmallInteger('num_llantas')->nullable()->after('capacidad_personas');
            $table->string('chasis', 100)->nullable()->after('num_llantas');
            $table->string('vin', 100)->nullable()->after('chasis');
            $table->string('motor_numero', 100)->nullable()->after('vin');
            $table->date('vencimiento_tarjeta')->nullable()->after('motor_numero');
            $table->string('activo_fijo', 100)->nullable()->after('vencimiento_tarjeta');
            $table->string('fotografia', 300)->nullable()->after('activo_fijo');
            $table->string('observacion', 300)->nullable()->after('fotografia');

            $table->index(['veh_estado_catalogo_id']);
            $table->index(['veh_marca_id', 'veh_modelo_id']);
        });
    }

    public function down(): void
    {
        Schema::table('vehiculos', function (Blueprint $table) {
            $table->dropConstrainedForeignId('veh_marca_id');
            $table->dropConstrainedForeignId('veh_modelo_id');
            $table->dropConstrainedForeignId('veh_color_id');
            $table->dropConstrainedForeignId('veh_tipo_motor_id');
            $table->dropConstrainedForeignId('veh_transmision_id');
            $table->dropConstrainedForeignId('veh_traccion_id');
            $table->dropConstrainedForeignId('veh_tipo_llanta_id');
            $table->dropConstrainedForeignId('veh_tipo_combustible_id');
            $table->dropConstrainedForeignId('veh_clasificacion_id');
            $table->dropConstrainedForeignId('veh_estado_catalogo_id');

            $table->dropColumn([
                'num_llantas',
                'chasis',
                'vin',
                'motor_numero',
                'vencimiento_tarjeta',
                'activo_fijo',
                'fotografia',
                'observacion',
            ]);
        });
    }
};
