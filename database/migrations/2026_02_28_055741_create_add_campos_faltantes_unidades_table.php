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
        Schema::table('unidad_solicitantes', function (Blueprint $table) {
            $table->string('codigo', 20)->nullable()->after('id');
            $table->string('descripcion', 300)->nullable()->after('siglas');
        });
    }

    public function down(): void
    {
        Schema::table('unidad_solicitantes', function (Blueprint $table) {
            $table->dropColumn(['codigo', 'descripcion']);
        });
    }
};
