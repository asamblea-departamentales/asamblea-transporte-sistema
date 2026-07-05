<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('solicitud_transportes', function (Blueprint $col) {
            // Usamos decimal(10,8) y (11,8) que es el estándar para coordenadas GPS
            $col->decimal('origen_lat', 10, 8)->nullable()->after('origen');
            $col->decimal('origen_lng', 11, 8)->nullable()->after('origen_lat');

            $col->decimal('destino_lat', 10, 8)->nullable()->after('destino');
            $col->decimal('destino_lng', 11, 8)->nullable()->after('destino_lat');

            $col->decimal('destino_adicional_lat', 10, 8)->nullable()->after('destino_adicional');
            $col->decimal('destino_adicional_lng', 11, 8)->nullable()->after('destino_adicional_lat');
        });
    }

    public function down(): void
    {
        Schema::table('solicitud_transportes', function (Blueprint $col) {
            $col->dropColumn([
                'origen_lat', 'origen_lng',
                'destino_lat', 'destino_lng',
                'destino_adicional_lat', 'destino_adicional_lng',
            ]);
        });
    }
};
