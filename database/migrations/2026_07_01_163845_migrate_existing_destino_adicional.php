<?php

use App\Models\SolicitudDestinoAdicional;
use App\Models\SolicitudTransporte;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        SolicitudTransporte::whereNotNull('destino_adicional')
            ->where('destino_adicional', '!=', '')
            ->chunk(100, function ($solicitudes) {
                foreach ($solicitudes as $s) {
                    $nombres = array_map('trim', explode(' - ', $s->destino_adicional));
                    $nombres = array_filter($nombres, fn ($n) => $n !== '');

                    if (empty($nombres)) {
                        continue;
                    }

                    $orden = 0;
                    foreach ($nombres as $i => $nombre) {
                        $lat = ($i === 0) ? $s->destino_adicional_lat : null;
                        $lng = ($i === 0) ? $s->destino_adicional_lng : null;

                        SolicitudDestinoAdicional::create([
                            'solicitud_transporte_id' => $s->id,
                            'nombre'                  => $nombre,
                            'lat'                     => $lat,
                            'lng'                     => $lng,
                            'agregado_por'            => null,
                            'agregado_durante_viaje'  => false,
                            'orden'                   => $orden++,
                        ]);
                    }
                }
            });
    }

    public function down(): void
    {
        SolicitudDestinoAdicional::whereNull('agregado_por')
            ->where('agregado_durante_viaje', false)
            ->delete();
    }
};
