<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
{
    Schema::create('mantenimiento_evaluaciones', function (Blueprint $table) {
        $table->id();
        
        // Indicamos explícitamente el nombre de la tabla 'solicitudes_mantenimiento'
        $table->foreignId('solicitud_mantenimiento_id')
              ->constrained('solicitudes_mantenimiento') 
              ->cascadeOnDelete();

        $table->foreignId('user_id')->constrained();

        $table->boolean('coincide');
        $table->text('observaciones')->nullable();

        $table->timestamps();
    });
}

    public function down(): void
    {
        Schema::dropIfExists('mantenimiento_evaluaciones');
    }
};