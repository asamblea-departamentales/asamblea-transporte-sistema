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
        Schema::create('unidad_solicitantes', function (Blueprint $table) {
            $table->id();
            $table->string('nombre')->unique(); //Evitar duplicados
            $table->string('siglas', 20)->nullable();
            $table->boolean('estado')->default(true); //Estado de la unidad solicitante
            $table->boolean('puede_solicitar_transporte')->default(true); //Indica si la unidad puede realizar solicitudes
            $table->timestamps();

            $table->softDeletes(); //Para no perder historial de unidades solicitantes
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('unidad_solicitantes');
    }
};
