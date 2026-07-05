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
        Schema::table('motoristas', function (Blueprint $table) {
            $table->foreignId('tipo_licencia_id')
                ->nullable()->after('id')
                ->constrained('tipo_licencias');
            $table->string('numero_empleado', 20)->nullable()->after('nombre');
            $table->string('numero_licencia', 100)->nullable()->after('dui');
            $table->string('correo', 100)->nullable()->after('telefono');
            $table->string('radio', 100)->nullable()->after('correo');
            $table->date('fecha_vencimiento_licencia')->nullable()->after('radio');
        });
    }

    public function down(): void
    {
        Schema::table('motoristas', function (Blueprint $table) {
            $table->dropForeign(['tipo_licencia_id']);
            $table->dropColumn([
                'tipo_licencia_id',
                'numero_empleado',
                'numero_licencia',
                'correo',
                'radio',
                'fecha_vencimiento_licencia',
            ]);
        });
    }
};
