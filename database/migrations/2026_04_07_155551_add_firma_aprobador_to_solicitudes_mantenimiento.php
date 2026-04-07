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
        Schema::table('solicitudes_mantenimiento', function (Blueprint $table) {
            $table->longText('firma_aprobador')->nullable()->after('observaciones');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('solicitudes_mantenimiento', function (Blueprint $table) {
            $table->dropColumn('firma_aprobador');
        });
    }
};
