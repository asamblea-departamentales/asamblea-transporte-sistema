<?php

use App\Domain\Solicitudes\Enums\EstadoLoteEnum;
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
        Schema::create('asignaciones_combustibles_lotes', function (Blueprint $table) {
            $table->id();
            $table->date('fecha');
            $table->foreignId('creado_por')->constrained('users')->restrictOnDelete();
            $table->string('estado', 20)->default(EstadoLoteEnum::BORRADOR->value);
            $table->text('observaciones')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asignaciones_combustibles_lotes');
    }
};
