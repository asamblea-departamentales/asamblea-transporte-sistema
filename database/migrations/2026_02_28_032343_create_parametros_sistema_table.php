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
        Schema::create('parametros_sistema', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 100)->unique();
            $table->string('nombre', 300);
            $table->string('tipo', 100)->default('string')
                ->comment('dropdown, enum, multiselect, true_false, integer, string, text, date, time, datetime, hidden');
            $table->string('valor', 300)->nullable();
            $table->string('valor_default', 300)->nullable();
            $table->text('data')->nullable();
            $table->boolean('es_sistema')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('parametros_sistema');
    }
};
