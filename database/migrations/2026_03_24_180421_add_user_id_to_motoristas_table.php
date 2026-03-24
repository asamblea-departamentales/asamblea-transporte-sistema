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
        // Creamos la columna y la relación
        $table->foreignId('user_id')
              ->nullable() 
              ->after('id') // Opcional: la pone después del ID para orden visual
              ->constrained('users')
              ->onDelete('set null'); // Si borras el usuario, el motorista queda libre
    });
}

public function down(): void
{
    Schema::table('motoristas', function (Blueprint $table) {
        // 1. Eliminamos la restricción de llave foránea
        $table->dropForeign(['user_id']); 
        // 2. Eliminamos la columna
        $table->dropColumn('user_id');
    });
}
};
