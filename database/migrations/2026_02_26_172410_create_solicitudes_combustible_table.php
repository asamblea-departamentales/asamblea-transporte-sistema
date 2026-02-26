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
        Schema::create('solicitudes_combustible', function (Blueprint $table) {
            $table->id();

            $table->string('codigo')->unique(); //Codigo único para cada solicitud

            //Periodo
            $table->date('fecha_solicitud');
            $table->date('fecha_inicio_periodo')->nullable();
            $table->date('fecha_fin_periodo')->nullable();

            //Vehiculo y Motorista Vinculada
            $table->foreignId('vehiculo_id')->constrained('vehiculos');
            $table->foreignId('motorista_id')->constrained('motoristas');

            //Asociada a solicitud de transporte (OPCIONAL)
            $table->foreignId('solicitud_transporte_id')->nullable()->constrained('solicitudes_transporte');

            //Destino / Actividad
            $table->string('destino_actividad');

            //Responsable
            $table->foreignId('solicitante_id')->constrained('users');

            //Combustible
            $table->decimal('cantidad_combustible', 10, 2); //Cantidad en litros/galones
            $table->decimal('valor_unitario', 10, 2); //Valor por unidad de combustible
            $table->decimal('valor_total', 10, 2); //Valor total (cantidad * valor_unitario)

            //Forma de pago (yo lo recibo desde el frontend nada mas)
            $table->enum('forma_pago', ['efectivo', 'tarjeta', 'vale', 'ticket', 'otro']);
            $table->string('numero_vale_ticket')->nullable(); //Número de vale o ticket si aplica

            //Comprobante (Recibo desde el frontend)
            $table->json('comprobantes')->nullable(); //URL del comprobante digitalizado 

            // Flujo
            $table->string('estado')->default('borrador');
            $table->string('prioridad')->default('media');
            $table->foreignId('aprobador_id')->nullable()->constrained('users');
            $table->timestamp('fecha_aprobacion')->nullable();
            $table->text('motivo_rechazo')->nullable();
            $table->text('observaciones')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('solicitudes_combustible');
    }
};
