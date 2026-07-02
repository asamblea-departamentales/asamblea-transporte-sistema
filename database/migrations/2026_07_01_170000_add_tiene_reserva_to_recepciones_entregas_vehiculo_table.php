<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('recepciones_entregas_vehiculo', function (Blueprint $table) {
            $table->boolean('tiene_reserva')->default(false)->after('nivel_combustible');
        });
    }

    public function down(): void
    {
        Schema::table('recepciones_entregas_vehiculo', function (Blueprint $table) {
            $table->dropColumn('tiene_reserva');
        });
    }
};
