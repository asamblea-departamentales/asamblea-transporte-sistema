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
        Schema::create('incidencias', function (Blueprint $table) {
            $table->id();

            //Relaciones
            $table->string('entidad_tipo');
            $table->unsignedBigInteger('entidad_id');
            
            //Datos principales de las incidencias
            $table->string('tipo');
            $table->string('severidad'); //Basado en el enum de severidad de la incidencia
            $table->text('descripcion');
            //Estado
            $table->string('estado');

            //Responsable de reportar la incidencia
            $table->foreignId('resportado_por')->constrained('users');
            $table->foreignId('asignado_a')->nullable()->constrained('users');

            //Resolucion 
            $table->text('resolucion')->nullable();
            $table->timestamp('fecha_resolucion')->nullable();

            //Evidencias simples
            $table->json('evidencias')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
{
    Schema::table('incidencias', function (Blueprint $table) {
        // Primero eliminamos las restricciones de llave foránea
        $table->dropForeign(['resportado_por']);
        $table->dropForeign(['asignado_a']);
    });

    Schema::dropIfExists('incidencias');
}
};
