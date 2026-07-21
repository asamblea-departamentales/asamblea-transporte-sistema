<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('historial_estados', function (Blueprint $table) {
            $table->index(['entidad_tipo', 'entidad_id']);
        });

        Schema::table('bitacora_eventos', function (Blueprint $table) {
            $table->index(['entidad_tipo', 'entidad_id']);
        });

        Schema::table('incidencias', function (Blueprint $table) {
            $table->index(['entidad_tipo', 'entidad_id']);
        });

        Schema::table('solicitud_transportes', function (Blueprint $table) {
            $table->index('estado');
        });

        Schema::table('solicitudes_combustible', function (Blueprint $table) {
            $table->index('estado');
        });

        Schema::table('solicitudes_mantenimiento', function (Blueprint $table) {
            $table->index('estado');
        });
    }

    public function down(): void
    {
        Schema::table('historial_estados', fn (Blueprint $t) => $t->dropIndex(['entidad_tipo', 'entidad_id']));
        Schema::table('bitacora_eventos', fn (Blueprint $t) => $t->dropIndex(['entidad_tipo', 'entidad_id']));
        Schema::table('incidencias', fn (Blueprint $t) => $t->dropIndex(['entidad_tipo', 'entidad_id']));
        Schema::table('solicitud_transportes', fn (Blueprint $t) => $t->dropIndex(['estado']));
        Schema::table('solicitudes_combustible', fn (Blueprint $t) => $t->dropIndex(['estado']));
        Schema::table('solicitudes_mantenimiento', fn (Blueprint $t) => $t->dropIndex(['estado']));
    }
};
