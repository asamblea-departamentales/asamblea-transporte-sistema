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
        Schema::create('historial_estados', function (Blueprint $table) {
    $table->id();

    $table->string('entidad_tipo'); // solicitud_transporte
    $table->unsignedBigInteger('entidad_id');

    $table->string('estado_anterior');
    $table->string('estado_nuevo');

    $table->foreignId('user_id')->constrained('users');
    $table->text('comentario')->nullable();

    $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('historial_estados');
    }
};
