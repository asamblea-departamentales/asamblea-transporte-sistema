<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE solicitudes_combustible MODIFY COLUMN forma_pago ENUM('carga', 'efectivo', 'tarjeta', 'vale', 'ticket', 'otro') DEFAULT NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE solicitudes_combustible MODIFY COLUMN forma_pago ENUM('efectivo', 'tarjeta', 'vale', 'ticket', 'otro') DEFAULT NULL");
    }
};
