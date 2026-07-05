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
        Schema::table('users', function (Blueprint $table) {
            // Añadimos la FK después del email y que sea nulleable por si acaso
            $table->foreignId('unidad_solicitante_id')
                ->nullable()
                ->after('email')
                ->constrained('unidad_solicitantes')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['unidad_solicitante_id']);
            $table->dropColumn('unidad_solicitante_id');
        });
    }
};
