<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('solicitud_transportes', function (Blueprint $table) {
            $table->text('origen')->change();
            $table->text('destino')->change();
            $table->text('destino_adicional')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('solicitud_transportes', function (Blueprint $table) {
            $table->string('origen')->change();
            $table->string('destino')->change();
            $table->string('destino_adicional')->nullable()->change();
        });
    }
};
