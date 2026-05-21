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
        Schema::table('solicitud_transportes', function (Blueprint $table) {
            $table->decimal('horas_estimadas', 5,2)->nullable()->after('fecha_retorno_real');
            $table->decimal('horas_reales', 5,2)->nullable()->after('horas_estimadas');
            $table->decimal('horas_espera', 5,2)->nullable()->default(0)->after('horas_reales');
            $table->dateTime('fecha_llegada_destino')->nullable()->after('fecha_salida_real');
            $table->dateTime('fecha_inicio_retorno')->nullable()->after('fecha_llegada_destino');
        });
        Schema::table('solicitud_transportes', function (Blueprint $table) {
            $table->string('decision_final')->nullable()->after('estado');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('solicitud_transportes', function (Blueprint $table) {
            
        });
    }
};
