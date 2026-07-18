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
            $table->string('encargado')->nullable()->after('tipo_vehiculo_nombre');
            $table->string('subencargado')->nullable()->after('encargado');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('solicitud_transportes', function (Blueprint $table) {
            $table->dropColumn(['encargado', 'subencargado']);
        });
    }
};
