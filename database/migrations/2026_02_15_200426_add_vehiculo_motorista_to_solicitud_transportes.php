<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('solicitud_transportes', function (Blueprint $table) {
            $table->foreignId('vehiculo_id')->nullable()->constrained('vehiculos');
            $table->foreignId('motorista_id')->nullable()->constrained('motoristas');
        });
    }

    public function down(): void
    {
        Schema::table('solicitud_transportes', function (Blueprint $table) {
            $table->dropForeign(['vehiculo_id']);
            $table->dropForeign(['motorista_id']);
            $table->dropColumn(['vehiculo_id', 'motorista_id']);
        });
    }
};
