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
        Schema::create('proveedores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('municipio_id')->constrained('municipios');
            $table->foreignId('actividad_economica_id')->constrained('actividades_economicas');
            $table->foreignId('tamano_proveedor_id')->nullable()->constrained('tamanos_proveedor');
            $table->string('nombre_comercial', 300);
            $table->string('nombre', 300);
            $table->string('apellido', 300)->nullable();
            $table->string('direccion', 300)->nullable();
            $table->string('dui', 100)->nullable();
            $table->string('nit', 100);
            $table->string('nrc', 100)->nullable();
            $table->tinyInteger('tipo_persona')->default(2)->comment('1=natural, 2=juridica');
            $table->boolean('activo')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('proveedores');
    }
};
