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
        Schema::create('bitacora_eventos', function (Blueprint $table) {
            $table->id();

            $table->string('entidad_tipo'); // Ej: Transporte, Combustible, etc
            $table->unsignedBigInteger('entidad_id'); // ID de la entidad afectada

            $table->string('accion'); // Usaremos el Enum de la app para definir las acciones
            $table->foreignId('user_id')->constrained('users'); // Usuario que realizo la accion
            $table->json('datos_extras')->nullable(); // Cualquier dato extra que queramos guardar
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bitacora_eventos');
    }
};
