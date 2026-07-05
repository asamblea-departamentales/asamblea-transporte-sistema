<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contrato_combustibles', function (Blueprint $table) {
            $table->id();
            $table->string('numero_contrato', 100)->unique();
            $table->string('nombre', 255);
            $table->decimal('monto_inicial', 12, 2);
            $table->decimal('monto_disponible', 12, 2);
            $table->date('fecha_inicio')->nullable();
            $table->date('fecha_fin')->nullable();
            $table->boolean('activo')->default(true);
            $table->text('observaciones')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contrato_combustibles');
    }
};
