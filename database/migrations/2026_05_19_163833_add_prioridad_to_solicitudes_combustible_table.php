<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('solicitudes_combustible', function (Blueprint $table) {
            if (! Schema::hasColumn('solicitudes_combustible', 'prioridad_grupo')) {
                $table->enum('prioridad_grupo', [
                    'critica',
                    'alta',
                    'media',
                    'baja',
                ])
                    ->nullable()
                    ->after('estado');
            }

            if (! Schema::hasColumn('solicitudes_combustible', 'prioridad_orden')) {
                $table->unsignedTinyInteger('prioridad_orden')
                    ->nullable()
                    ->after('prioridad_grupo')
                    ->index();
            }
        });
    }

    public function down(): void
    {
        Schema::table('solicitudes_combustible', function (Blueprint $table) {
            $columns = Schema::getColumnListing('solicitudes_combustible');

            if (in_array('prioridad_grupo', $columns)) {
                $table->dropColumn('prioridad_grupo');
            }
            if (in_array('prioridad_orden', $columns)) {
                $table->dropColumn('prioridad_orden');
            }
        });
    }
};
