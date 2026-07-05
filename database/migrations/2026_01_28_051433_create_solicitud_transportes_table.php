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
        Schema::create('solicitud_transportes', function (Blueprint $table) {
            $table->id();
            $table->string('codigo')->unique(); // Codigo unico para cada solicitud EJ: TR-2024-0001

            // Relacion con unidad_solicitantes
            $table->foreignId('unidad_solicitante_id')->constrained('unidad_solicitantes')->onDelete('cascade');
            $table->foreignId('solicitante_id')->constrained('users')->onDelete('cascade'); // Usuario que realiza la solicitud

            // Detalles de la solicitud
            $table->text('motivo_actividad');
            $table->string('origen');
            $table->string('destino');
            $table->dateTime('fecha_salida');
            $table->dateTime('fecha_retorno')->nullable();
            $table->integer('cantidad_personas')->default(1);

            // Para los estados de la solicitud
            $table->string('prioridad')->default(value: 'media'); // baja, media, alta
            $table->string('estado')->default(value: 'pendiente'); // pendiente, aprobada, rechazada, en_proceso, completada, cancelada

            // Campos para auditoria
            $table->text('comentario_jefe')->nullable();
            $table->foreignId('decidido_por')->nullable()->constrained('users');
            $table->dateTime('decidido_en')->nullable();

            $table->timestamps();
            $table->softDeletes(); // Para no perder historial de solicitudes
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('solicitud_transportes');
    }
};
