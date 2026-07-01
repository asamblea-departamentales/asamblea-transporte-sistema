<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('solicitud_destinos_adicionales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('solicitud_transporte_id')
                ->constrained('solicitud_transportes')
                ->cascadeOnDelete();
            $table->string('nombre');
            $table->decimal('lat', 10, 8)->nullable();
            $table->decimal('lng', 11, 8)->nullable();
            $table->foreignId('agregado_por')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->boolean('agregado_durante_viaje')->default(false);
            $table->unsignedSmallInteger('orden')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('solicitud_destinos_adicionales');
    }
};
