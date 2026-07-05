<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Desactivar restricciones temporalmente
        Schema::disableForeignKeyConstraints();

        Schema::create('solicitudes_combustible', function (Blueprint $table) {
            $table->id();
            $table->string('codigo')->unique();
            $table->date('fecha_solicitud');
            $table->date('fecha_inicio_periodo')->nullable();
            $table->date('fecha_fin_periodo')->nullable();

            $table->foreignId('vehiculo_id')->constrained('vehiculos');
            $table->foreignId('motorista_id')->constrained('motoristas');

            // Relación opcional con transporte
            $table->foreignId('solicitud_transporte_id')
                ->nullable()
                ->constrained('solicitudes_transporte')
                ->nullOnDelete();

            $table->string('destino_actividad');
            $table->foreignId('solicitante_id')->constrained('users');

            $table->decimal('cantidad_combustible', 10, 2);
            $table->decimal('valor_unitario', 10, 2);
            $table->decimal('valor_total', 10, 2);

            $table->enum('forma_pago', ['efectivo', 'tarjeta', 'vale', 'ticket', 'otro']);
            $table->string('numero_vale_ticket')->nullable();
            $table->json('comprobantes')->nullable();

            $table->string('estado')->default('borrador');
            $table->string('prioridad')->default('media');
            $table->foreignId('aprobador_id')->nullable()->constrained('users');
            $table->timestamp('fecha_aprobacion')->nullable();
            $table->text('motivo_rechazo')->nullable();
            $table->text('observaciones')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });

        // Reactivar restricciones
        Schema::enableForeignKeyConstraints();
    }

    public function down(): void
    {
        Schema::dropIfExists('solicitudes_combustible');
    }
};
