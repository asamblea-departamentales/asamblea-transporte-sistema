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
    Schema::table('solicitud_transportes', function (Blueprint $table) {
        // Creamos la relación con la tabla tipo_vehiculos
        $table->foreignId('tipo_vehiculo_id')
              ->nullable()
              ->constrained('tipo_vehiculos') // Asegúrate que tu tabla se llame así
              ->nullOnDelete()
              ->after('motivo_actividad');
    });
}

public function down(): void
{
    Schema::table('solicitud_transportes', function (Blueprint $table) {
        $table->dropColumn('tipo_vehiculo');
    });
}
};
