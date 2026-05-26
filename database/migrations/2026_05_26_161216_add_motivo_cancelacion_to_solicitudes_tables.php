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
        Schema::table('solicitud_transportes', function (Blueprint $table) {
            $table->text('motivo_cancelacion')->nullable()->after('estado');
        });

        Schema::table('solicitudes_combustible', function (Blueprint $table) {
            $table->text('motivo_cancelacion')->nullable()->after('motivo_rechazo');
        });

        Schema::table('solicitudes_mantenimiento', function (Blueprint $table) {
            $table->text('motivo_cancelacion')->nullable()->after('motivo_rechazo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('solicitud_transportes', function (Blueprint $table) {
            $table->dropColumn('motivo_cancelacion');
        });

        Schema::table('solicitudes_combustible', function (Blueprint $table) {
            $table->dropColumn('motivo_cancelacion');
        });

        Schema::table('solicitudes_mantenimiento', function (Blueprint $table) {
            $table->dropColumn('motivo_cancelacion');
        });
    }
};
