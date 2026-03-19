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
        Schema::table('solicitudes_mantenimiento', function (Blueprint $table) {
            // Estado de la evaluación: conforme, con_observaciones, no_conforme
            $table->string('evaluacion_estado')->nullable()->after('estado'); 
            
            $table->text('evaluacion_comentario')->nullable()->after('evaluacion_estado');
            
            // Quién evaluó (Jefe o Administrador)
            $table->foreignId('evaluado_por')
                  ->nullable()
                  ->after('evaluacion_comentario')
                  ->constrained('users')
                  ->nullOnDelete(); // Si el usuario se borra, el registro queda pero como null

            $table->timestamp('fecha_evaluacion')->nullable()->after('evaluado_por');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('solicitudes_mantenimiento', function (Blueprint $table) {
            // Es vital definir el drop de la llave foránea antes de las columnas
            $table->dropForeign(['evaluado_por']);
            
            $table->dropColumn([
                'evaluacion_estado',
                'evaluacion_comentario',
                'evaluado_por',
                'fecha_evaluacion'
            ]);
        });
    }
};