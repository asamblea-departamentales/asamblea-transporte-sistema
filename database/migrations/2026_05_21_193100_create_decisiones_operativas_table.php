<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('decisiones_operativas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('solicitud_id')->constrained('solicitud_transportes')->cascadeOnDelete();
            $table->foreignId('usuario_operativo_id')->constrained('users');
            $table->foreignId('vehiculo_final_id')->constrained('vehiculos');
            $table->foreignId('motorista_final_id')->constrained('motoristas');
            $table->string('cambio_detectado'); // ninguno, chofer, vehiculo, ambos
            $table->text('justificacion')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('decisiones_operativas');
    }
};
