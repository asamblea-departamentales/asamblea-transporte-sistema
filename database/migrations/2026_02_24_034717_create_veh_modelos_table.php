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
     Schema::create('veh_modelos', function (Blueprint $table) {
        $table->id();
        $table->foreignId('veh_marca_id')->constrained('veh_marcas');
        $table->string('nombre');
        $table->boolean('activo')->default(true);
        $table->timestamps();

        $table->unique(['veh_marca_id', 'nombre']);
        $table->index('veh_marca_id', 'activo');
     });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('veh_modelos');
    }
};
