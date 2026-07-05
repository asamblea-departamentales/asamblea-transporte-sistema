<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('solicitudes_mantenimiento', function (Blueprint $table) {
            $table->id();

            $table->string('codigo')->unique();
            $table->foreignId('vehiculo_id')->constrained('vehiculos');
            $table->foreignId('veh_tipo_mantenimiento_id')->constrained('veh_tipo_mantenimientos');
            $table->enum('tipo_solicitud', ['taller', 'llantas']);
            $table->text('detalle');
            $table->date('fecha_sugerida');
            $table->date('fecha_realizada')->nullable();

            $table->foreignId('solicitante_id')->constrained('users');
            $table->string('prioridad')->default('media');

            $table->decimal('costo_estimado', 10, 2)->nullable();
            $table->decimal('costo_real', 10, 2)->nullable();

            $table->string('estado')->default('borrador');
            $table->foreignId('aprobador_id')->nullable()->constrained('users');
            $table->timestamp('fecha_aprobacion')->nullable();
            $table->text('motivo_rechazo')->nullable();
            $table->text('observaciones')->nullable();

            $table->json('adjuntos')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('solicitudes_mantenimiento');
    }
};
