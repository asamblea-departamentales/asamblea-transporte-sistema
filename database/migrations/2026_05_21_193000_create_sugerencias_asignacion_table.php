<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sugerencias_asignacion', function (Blueprint $table) {
            $table->id();
            $table->foreignId('solicitud_id')->constrained('solicitud_transportes')->cascadeOnDelete();
            $table->foreignId('vehiculo_sugerido_id')->constrained('vehiculos');
            $table->foreignId('motorista_sugerido_id')->constrained('motoristas');
            $table->decimal('horas_motorista_periodo', 5, 2)->default(0);
            $table->unsignedTinyInteger('combustible_porcentaje')->nullable();
            $table->unsignedTinyInteger('score_confianza');
            $table->json('bullets_tecnicos');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sugerencias_asignacion');
    }
};
