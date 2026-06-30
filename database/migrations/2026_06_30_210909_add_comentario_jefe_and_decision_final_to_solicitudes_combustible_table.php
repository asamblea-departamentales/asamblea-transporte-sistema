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
        Schema::table('solicitudes_combustible', function (Blueprint $table) {
            $table->text('comentario_jefe')->nullable()->after('observaciones');
            $table->string('decision_final')->nullable()->after('comentario_jefe');
        });
    }

    public function down(): void
    {
        Schema::table('solicitudes_combustible', function (Blueprint $table) {
            $table->dropColumn(['comentario_jefe', 'decision_final']);
        });
    }
};
