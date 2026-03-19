<?php


use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('liquidaciones_combustible', function (Blueprint $table) {
            $table->id();

            $table->foreignId('solicitud_id')
                ->constrained('solicitud_combustibles')
                ->cascadeOnDelete();

            $table->foreignId('user_id')
                ->constrained('users');

            $table->decimal('monto_solicitado', 10, 2);
            $table->decimal('monto_validado', 10, 2);

            $table->enum('resultado', ['coincide', 'discrepancia']);

            $table->text('observaciones')->nullable();

            $table->timestamp('fecha_liquidacion');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('liquidaciones_combustible');
    }
};