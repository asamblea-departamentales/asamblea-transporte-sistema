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
        Schema::create('motorista_estados', function (Blueprint $table) {
            $table->id();

            $table->foreignId('motorista_id')->constrained()->cascadeOnDelete();
            $table->boolean('activo')->default(true);
            $table->string('motivo')->nullable();

            $table->timestamp('fecha_inicio')->useCurrent();
            $table->timestamp('fecha_fin')->nullable();
            $table->foreignId('user_id')->nullable()->constrained();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('motorista_estados');
    }
};
