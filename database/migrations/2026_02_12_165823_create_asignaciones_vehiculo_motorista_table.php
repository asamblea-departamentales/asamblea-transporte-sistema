<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asignaciones_vehiculo_motorista', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehiculo_id')->constrained('vehiculos');
            $table->foreignId('motorista_id')->constrained('motoristas');
            $table->dateTime('desde');
            $table->dateTime('hasta')->nullable();
            $table->boolean('vigente')->default(true);
            $table->timestamps();

            $table->index(['vehiculo_id', 'vigente']);
            $table->index(['motorista_id', 'vigente']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asignaciones_vehiculo_motorista');
    }
};
