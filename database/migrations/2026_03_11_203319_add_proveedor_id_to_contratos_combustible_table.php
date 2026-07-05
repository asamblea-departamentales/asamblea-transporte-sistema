<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // <--- ESTA LLAVE ES LA QUE TE FALTA
    public function up(): void
    {
        Schema::table('contrato_combustibles', function (Blueprint $table) {
            $table->foreignId('proveedor_id')
                ->nullable()
                ->after('id')
                ->constrained('proveedores')
                ->cascadeOnUpdate()
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('contrato_combustibles', function (Blueprint $table) {
            $table->dropForeign(['proveedor_id']);
            $table->dropColumn('proveedor_id');
        });
    }
}; // Y asegúrate de que esta llave cierre con el punto y coma
