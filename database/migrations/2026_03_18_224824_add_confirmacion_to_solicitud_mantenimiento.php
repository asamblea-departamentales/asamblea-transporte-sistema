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
            $table->foreignId('finalizado_por')->nullable()->constrained('users');
            $table->timestamp('fecha_finalizacion')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('solicitudes_mantenimiento', function (Blueprint $table) {
            $table->dropForeign(['finalizado_por']);
            $table->dropColumn(['finalizado_por', 'fecha_finalizacion']);
        });
    }
};
