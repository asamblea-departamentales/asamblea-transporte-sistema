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
        Schema::table('serie_vales', function (Blueprint $table) {
            if (! Schema::hasColumn('serie_vales', 'contrato_id')) {
                $table->foreignId('contrato_id')
                    ->nullable()
                    ->after('id') // La ponemos al inicio para que sea fácil de ver
                    ->constrained('contrato_combustibles')
                    ->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('serie_vales', function (Blueprint $table) {
            $table->dropConstrainedForeignId('contrato_id');
        });
    }
};
