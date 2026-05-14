<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
   public function up(): void
{
    // 1. Add the new JSON column first
    Schema::table('recepciones_entregas_vehiculo', function (Blueprint $table) {
        $table->json('herramientas_verificadas')->nullable()->after('nivel_combustible');
    });

    // 2. Migrate the data WHILE the column is still a string
    $this->migrarDatosExistentes();

    // 3. NOW change the column type to integer
    Schema::table('recepciones_entregas_vehiculo', function (Blueprint $table) {
        $table->unsignedTinyInteger('nivel_combustible')->nullable()->change();
    });
}

    public function down(): void
    {
        Schema::table('recepciones_entregas_vehiculo', function (Blueprint $table) {
            $table->string('nivel_combustible', 20)->nullable()->change();
            $table->dropColumn('herramientas_verificadas');
        });
    }

    private function migrarDatosExistentes(): void
    {
        $mapa = [
            'vacio' => 0,
            '1/4' => 25,
            '1/2' => 50,
            '3/4' => 75,
            'lleno' => 100,
        ];

        $registros = DB::table('recepciones_entregas_vehiculo')
            ->whereNotNull('nivel_combustible')
            ->orWhere(function ($q) {
                $q->where('herramientas_completas', true)
                    ->orWhere('herramientas_completas', false);
            })
            ->get();

        foreach ($registros as $r) {
            $update = [];

            if (! is_null($r->nivel_combustible) && isset($mapa[$r->nivel_combustible])) {
                $update['nivel_combustible'] = $mapa[$r->nivel_combustible];
            }

            if ($r->herramientas_completas) {
                $update['herramientas_verificadas'] = json_encode([
                    'gato', 'llanta_repuesto', 'triangulos', 'extintor',
                    'llave_cruz', 'botiquin', 'cables_inicio', 'herramientas', 'chaleco',
                ]);
            } else {
                $update['herramientas_verificadas'] = json_encode([]);
            }

            if (! empty($update)) {
                DB::table('recepciones_entregas_vehiculo')
                    ->where('id', $r->id)
                    ->update($update);
            }
        }
    }
};
