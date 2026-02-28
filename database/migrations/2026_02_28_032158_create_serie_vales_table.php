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
        Schema::create('serie_vales', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 100);
            $table->decimal('valor', 19, 2);
            $table->decimal('valor_compra', 19, 2)->nullable();
            $table->date('fecha_emision');
            $table->date('fecha_vencimiento');
            $table->date('fecha_recibido');
            $table->integer('correlativo_inicio');
            $table->integer('correlativo_fin');
            $table->integer('cantidad');
            $table->text('observaciones')->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('serie_vales');
    }
};
