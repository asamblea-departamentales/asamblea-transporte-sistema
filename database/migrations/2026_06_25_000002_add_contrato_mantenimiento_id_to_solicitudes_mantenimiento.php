<?php

use App\Models\ContratoMantenimiento;
use App\Models\SolicitudMantenimiento;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('solicitudes_mantenimiento', function (Blueprint $table) {
            $table->foreignId('contrato_mantenimiento_id')
                ->nullable()
                ->after('observaciones')
                ->constrained('contratos_mantenimiento')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('solicitudes_mantenimiento', function (Blueprint $table) {
            $table->dropForeign(['contrato_mantenimiento_id']);
            $table->dropColumn('contrato_mantenimiento_id');
        });
    }
};
