<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recepciones_entregas_vehiculo', function (Blueprint $table) {
            $table->id();

            $table->foreignId('vehiculo_id')->constrained('vehiculos');
            $table->foreignId('motorista_id')->nullable()->constrained('motoristas')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();

            $table->enum('tipo_movimiento', ['recepcion', 'entrega']);
            $table->dateTime('fecha_hora');

            $table->unsignedBigInteger('kilometraje')->nullable();
            $table->string('nivel_combustible', 20)->nullable();

            $table->text('estado_exterior')->nullable();
            $table->text('estado_interior')->nullable();

            $table->boolean('herramientas_completas')->default(false);
            $table->boolean('accesorios_completos')->default(false);

            $table->string('entregado_por')->nullable();
            $table->string('recibido_por')->nullable();

            $table->text('observaciones')->nullable();
            $table->json('adjuntos')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recepciones_entregas_vehiculo');
    }
};