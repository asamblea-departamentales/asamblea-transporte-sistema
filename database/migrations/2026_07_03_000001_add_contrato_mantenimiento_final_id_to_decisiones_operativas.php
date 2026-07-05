<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('decisiones_operativas', function (Blueprint $table) {
            $table->foreignId('contrato_mantenimiento_final_id')
                ->nullable()
                ->after('monto_aprobado')
                ->constrained('contratos_mantenimiento')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('decisiones_operativas', function (Blueprint $table) {
            $table->dropForeign(['contrato_mantenimiento_final_id']);
            $table->dropColumn('contrato_mantenimiento_final_id');
        });
    }
};
