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
        // Asegúrate de que el nombre de la tabla sea 'solicitud_transportes'
        // (o 'solicitudes_transporte' según lo que uses en tus modelos)
        Schema::table('solicitud_transportes', function (Blueprint $table) {
            $table->foreignId('confirmado_por')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete(); // Faltaban los paréntesis ()

            $table->timestamp('confirmado_en')
                ->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('solicitud_transportes', function (Blueprint $table) {
            $table->dropForeign(['confirmado_por']);
            $table->dropColumn(['confirmado_por', 'confirmado_en']);
        });
    }
};
