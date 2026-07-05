<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('solicitud_transportes', function (Blueprint $table) {
            $table->longText('firma_aprobador')->nullable()->after('comentario_jefe');
        });
    }

    public function down(): void
    {
        Schema::table('solicitud_transportes', function (Blueprint $table) {
            $table->dropColumn('firma_aprobador');
        });
    }
};
