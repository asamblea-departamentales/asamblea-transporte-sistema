<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
   public function up(): void
{
    // 1. Intentamos borrar la llave ignorando fallos
    try {
        Schema::table('solicitudes_combustible', function (Blueprint $table) {
            $table->dropForeign('solicitudes_combustible_solicitud_transporte_id_foreign');
        });
    } catch (\Exception $e) {
        // No hacemos nada, si no existe, mejor.
    }

    // 2. Creamos la relación correcta
    Schema::table('solicitudes_combustible', function (Blueprint $table) {
        $table->foreign('solicitud_transporte_id')
            ->references('id')
            ->on('solicitud_transportes')
            ->onDelete('set null');
    });
}

    public function down(): void
    {
        Schema::table('solicitudes_combustible', function (Blueprint $table) {
            $table->dropForeign(['solicitud_transporte_id']);
            
            // Revertimos al error original por si acaso (aunque no es lo ideal)
            $table->foreign('solicitud_transporte_id')
                ->references('id')
                ->on('solicitudes_transporte')
                ->onDelete('set null');
        });
    }
};