<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Tabla recepciones_entregas_vehiculo
        Schema::table('recepciones_entregas_vehiculo', function (Blueprint $table) {
            $table->foreignId('solicitudes_transporte_id')
                ->nullable()
                ->after('id')
                ->constrained('solicitudes_transportes')
                ->nullOnDelete();
        });

        // Tabla solicitud_transportes
        Schema::table('solicitudes_transporte', function (Blueprint $table) {
            $table->dateTime('fecha_salida_real')->nullable()->after('fecha_retorno');
            $table->dateTime('fecha_retorno_real')->nullable()->after('fecha_salida_real');
            $table->foreignId('despachado_por')
                ->nullable()
                ->after('fecha_retorno_real')
                ->constrained('users')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('recepciones_entregas_vehiculo', function (Blueprint $table) {
            $table->dropForeignIdFor(\App\Models\SolicitudTransporte::class, 'solicitud_transporte_id');
            $table->dropColumn('solicitud_transporte_id');
        });

        Schema::table('solicitudes_transporte', function (Blueprint $table) {
            $table->dropForeign(['despachado_por']);
            $table->dropColumn(['fecha_salida_real', 'fecha_retorno_real', 'despachado_por']);
        });
    }
};