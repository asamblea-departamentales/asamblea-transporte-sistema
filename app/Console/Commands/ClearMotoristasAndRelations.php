<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ClearMotoristasAndRelations extends Command
{
    protected $signature = 'clear:motoristas {--yes : Skip confirmation}';

    protected $description = 'Elimina registros dependientes de motoristas y trunca la tabla motoristas';

    public function handle(): int
    {
        if (! $this->option('yes')) {
            if (! $this->confirm('Esto eliminará datos dependientes y truncará `motoristas`. ¿Continuar?')) {
                $this->info('Cancelado por el usuario.');
                return 1;
            }
        }

        DB::beginTransaction();
        try {
            // Desactivar FK para operaciones masivas
            DB::statement('SET FOREIGN_KEY_CHECKS=0');

            $deleted = [];

            // Tablas que dependen obligatoriamente de motorista -> borramos
            $deleted['decisiones_operativas'] = DB::table('decisiones_operativas')->delete();
            $deleted['sugerencias_asignacion'] = DB::table('sugerencias_asignacion')->delete();
            $deleted['asignaciones_vehiculo_motorista'] = DB::table('asignaciones_vehiculo_motorista')->delete();
            $deleted['solicitudes_combustible'] = DB::table('solicitudes_combustible')->delete();

            // Columnas nullable: setear a NULL
            $updated = [];
            $updated['solicitud_transportes.motorista_id'] = DB::table('solicitud_transportes')->update(['motorista_id' => null]);
            $updated['recepciones_entregas_vehiculo.motorista_id'] = DB::table('recepciones_entregas_vehiculo')->update(['motorista_id' => null]);

            // Finalmente truncar motoristas
            DB::table('motoristas')->truncate();

            DB::statement('SET FOREIGN_KEY_CHECKS=1');
            DB::commit();

            $this->info('Operación completada. Resumen:');
            foreach ($deleted as $k => $v) {
                $this->line("- Borrados en {$k}: {$v}");
            }
            foreach ($updated as $k => $v) {
                $this->line("- Filas actualizadas en {$k}: {$v}");
            }

            return 0;
        } catch (\Exception $e) {
            DB::rollBack();
            DB::statement('SET FOREIGN_KEY_CHECKS=1');
            $this->error('Error: ' . $e->getMessage());
            return 2;
        }
    }
}
