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
            $table->bigInteger('ticket')->nullable()->unique()->after('codigo');
        });

        Schema::table('solicitudes_combustible', function (Blueprint $table) {
            $table->bigInteger('ticket')->nullable()->unique()->after('codigo');
        });

        Schema::table('solicitudes_mantenimiento', function (Blueprint $table) {
            $table->bigInteger('ticket')->nullable()->unique()->after('codigo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('solicitud_transportes', function (Blueprint $table) {
            $table->dropColumn('ticket');
        });

        Schema::table('solicitudes_combustible', function (Blueprint $table) {
            $table->dropColumn('ticket');
        });

        Schema::table('solicitudes_mantenimiento', function (Blueprint $table) {
            $table->dropColumn('ticket');
        });
    }
};
