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
        Schema::create('asignaciones_combustibles_lote_detalles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lote_id')->constrained('asignaciones_combustibles_lotes')->cascadeOnDelete();
            $table->foreignId('vehiculo_id')->constrained('vehiculos')->restrictOnDelete();
            $table->foreignId('solicitud_combustible_id')->nullable()
                ->constrained('solicitudes_combustible', indexName: 'lote_detalle_solicitud_fk')
                ->nullOnDelete();
            $table->string('placa_cache', 20);
            $table->decimal('monto_asignado', 19, 2);
            $table->string('numero_ticket', 50);
            $table->timestamps();

            // Evitar duplicados del mimso vehículo en el mismo lote
            $table->unique(['lote_id', 'vehiculo_id'], 'lote_detalle_vehiculo_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asignaciones_combustibles_lote_detalles');
    }
};
