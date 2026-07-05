<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('solicitud_transportes', function (Blueprint $table) {
            // Eliminamos el índice único usando el nombre exacto que vimos en MariaDB
            $table->dropUnique('solicitud_transportes_codigo_unique');
        });
    }

    public function down(): void
    {
        Schema::table('solicitud_transportes', function (Blueprint $table) {
            // Por si necesitas revertirlo, vuelve a hacerlo único
            $table->unique('codigo');
        });
    }
};
