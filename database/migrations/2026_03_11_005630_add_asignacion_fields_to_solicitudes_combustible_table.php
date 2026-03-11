<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
{
    Schema::table('solicitudes_combustible', function (Blueprint $table) {
        if (!Schema::hasColumn('solicitudes_combustible', 'contrato_id')) {
            $table->foreignId('contrato_id')
                ->nullable()
                ->after('vehiculo_id')
                ->constrained('contrato_combustibles')
                ->nullOnDelete();
        }

        if (!Schema::hasColumn('solicitudes_combustible', 'serie_vale_id')) {
            $table->foreignId('serie_vale_id')
                ->nullable()
                ->after('contrato_id')
                ->constrained('serie_vales')
                ->nullOnDelete();
        }

        if (!Schema::hasColumn('solicitudes_combustible', 'correlativo_inicio')) {
            $table->unsignedBigInteger('correlativo_inicio')->nullable()->after('serie_vale_id');
        }

        if (!Schema::hasColumn('solicitudes_combustible', 'correlativo_fin')) {
            $table->unsignedBigInteger('correlativo_fin')->nullable()->after('correlativo_inicio');
        }

        if (!Schema::hasColumn('solicitudes_combustible', 'cantidad_vales')) {
            $table->unsignedInteger('cantidad_vales')->nullable()->after('correlativo_fin');
        }

        if (!Schema::hasColumn('solicitudes_combustible', 'valor_unitario_vale')) {
            $table->decimal('valor_unitario_vale', 10, 2)->nullable()->after('cantidad_vales');
        }

        if (!Schema::hasColumn('solicitudes_combustible', 'monto_asignado')) {
            $table->decimal('monto_asignado', 12, 2)->nullable()->after('valor_unitario_vale');
        }

        if (!Schema::hasColumn('solicitudes_combustible', 'fecha_asignacion')) {
            $table->timestamp('fecha_asignacion')->nullable()->after('monto_asignado');
        }

        if (!Schema::hasColumn('solicitudes_combustible', 'asignado_por')) {
            $table->foreignId('asignado_por')
                ->nullable()
                ->after('fecha_asignacion')
                ->constrained('users')
                ->nullOnDelete();
        }
    });
}

    public function down(): void
    {
        Schema::table('solicitudes_combustible', function (Blueprint $table) {
            $table->dropConstrainedForeignId('contrato_id');
            $table->dropConstrainedForeignId('serie_vale_id');
            $table->dropColumn([
                'correlativo_inicio',
                'correlativo_fin',
                'cantidad_vales',
                'valor_unitario_vale',
                'monto_asignado',
                'fecha_asignacion',
            ]);
            $table->dropConstrainedForeignId('asignado_por');
        });
    }
};