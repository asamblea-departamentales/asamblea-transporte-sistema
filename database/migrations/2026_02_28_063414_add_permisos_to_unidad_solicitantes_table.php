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
            $table->boolean('puede_solicitar_mantenimiento')->default(false)->after('puede_solicitar_transporte');
            $table->boolean('puede_solicitar_combustible')->default(false)->after('puede_solicitar_mantenimiento');
        });
    }

    public function down(): void
    {
        Schema::table('unidad_solicitantes', function (Blueprint $table) {
            $table->dropColumn(['puede_solicitar_mantenimiento', 'puede_solicitar_combustible']);
        });
    }
};
