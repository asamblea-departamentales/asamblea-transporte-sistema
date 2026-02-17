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
        // Guardamos el nombre tal cual viene del frontend
        $table->string('tipo_vehiculo_nombre')->nullable()->after('motivo_actividad');
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('solicitud_transportes', function (Blueprint $table) {
            //
        });
    }
};
