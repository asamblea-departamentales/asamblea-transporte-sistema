<?php

use App\Models\SolicitudTransporte;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('decisiones_operativas', function (Blueprint $table) {
            // 1. Drop existing FK constraints
            $table->dropForeign(['solicitud_id']);
            $table->dropForeign(['vehiculo_final_id']);
            $table->dropForeign(['motorista_final_id']);

            // 2. Rename solicitud_id → decidable_id
            $table->renameColumn('solicitud_id', 'decidable_id');

            // 3. Add decidable_type (default to SolicitudTransporte for existing rows)
            $table->string('decidable_type', 100)
                ->default(SolicitudTransporte::class)
                ->after('decidable_id');

            // 4. Make vehiculo/motorista nullable (combustible no los necesita)
            $table->unsignedBigInteger('vehiculo_final_id')->nullable()->change();
            $table->unsignedBigInteger('motorista_final_id')->nullable()->change();

            // 5. Re-add FK constraints as nullable (mantiene integridad cuando hay valor)
            $table->foreign('vehiculo_final_id')->references('id')->on('vehiculos')->nullOnDelete();
            $table->foreign('motorista_final_id')->references('id')->on('motoristas')->nullOnDelete();

            // 6. Campo para combustible: monto aprobado por el operativo
            $table->decimal('monto_aprobado', 12, 2)->nullable()->after('justificacion');
        });
    }

    public function down(): void
    {
        Schema::table('decisiones_operativas', function (Blueprint $table) {
            $table->dropForeign(['vehiculo_final_id']);
            $table->dropForeign(['motorista_final_id']);
            $table->dropColumn('monto_aprobado');
            $table->dropColumn('decidable_type');

            $table->renameColumn('decidable_id', 'solicitud_id');

            $table->unsignedBigInteger('vehiculo_final_id')->nullable(false)->change();
            $table->unsignedBigInteger('motorista_final_id')->nullable(false)->change();

            $table->foreign('solicitud_id')->references('id')->on('solicitud_transportes')->cascadeOnDelete();
            $table->foreign('vehiculo_final_id')->references('id')->on('vehiculos')->cascadeOnDelete();
            $table->foreign('motorista_final_id')->references('id')->on('motoristas')->cascadeOnDelete();
        });
    }
};
