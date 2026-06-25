<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ContratosCombustibleTransporteSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();
        $hoyStr = $now->toDateString();

        $contratos = [
            ['id' => 106, 'proveedor_id' => 20, 'numero' => '13/2025-ID106', 'nombre' => 'SEGUNDO SUMINISTRO DE TARJETAS ELECTRONICAS PARA COMBUSTIBLE', 'codigo' => '2025-04-01', 'resolucion' => '2025-04-01', 'inicio' => '2025-09-04', 'fin' => '2026-04-23', 'monto' => 69995.00, 'nota' => 'Numero original 13/2025 desambiguado por duplicidad con con_id=102.'],
            ['id' => 102, 'proveedor_id' => 20, 'numero' => '13/2025-ID102', 'nombre' => 'SUMINISTRO DE TARJETAS ELECTRONICAS PARA COMBUSTIBLE 2025', 'codigo' => '2025-04-01', 'resolucion' => '2025-04-01', 'inicio' => '2025-04-09', 'fin' => '2025-12-31', 'monto' => 110005.00, 'nota' => 'Numero original 13/2025 desambiguado por duplicidad con con_id=106.'],
            ['id' => 99, 'proveedor_id' => 20, 'numero' => 'SUMINISTRO DE COMBUSTIBLE', 'nombre' => 'SUMINISTRO DE COMBUSTIBLE NUMERO 2 POR MEDIO DE CUPONES PARA EL ANO 2024', 'codigo' => '1266', 'resolucion' => '1266', 'inicio' => '2024-08-20', 'fin' => '2024-12-31', 'monto' => null],
            ['id' => 100, 'proveedor_id' => 20, 'numero' => '11/2023 (PRORROGA)', 'nombre' => 'ENTREGA FINAL DE SUMINISTRO DE COMBUSTIBLE POR MEDIO DE CUPONES PARA EL ANO 2024', 'codigo' => '1266', 'resolucion' => '1266', 'inicio' => '2024-08-20', 'fin' => '2024-12-31', 'monto' => null],
            ['id' => 98, 'proveedor_id' => 20, 'numero' => '2024-SUMINISTRO DE COMBUSTIBLE POR MEDIO DE CUPONES O EQUIVALENTE', 'nombre' => 'SUMINISTRO DE COMBUSTIBLE POR MEDIO DE CUPONES PARA EL ANO 2024', 'codigo' => '1266', 'resolucion' => '1266', 'inicio' => '2024-01-01', 'fin' => '2024-12-28', 'monto' => null],
            ['id' => 94, 'proveedor_id' => 20, 'numero' => 'SIN-NUMERO-94', 'nombre' => 'SUMINISTRO DE COMBUSTIBLE POR MEDIO DE CUPONES PARA EL ANO 2023', 'codigo' => '862', 'resolucion' => '2023-04-01', 'inicio' => '2023-02-16', 'fin' => '2023-12-31', 'monto' => 180000.00, 'nota' => 'Numero de contrato no disponible en sistema origen; venia como fecha 2023-11-01.'],
            ['id' => 90, 'proveedor_id' => 20, 'numero' => '31/2022', 'nombre' => 'SUMINISTRO DE COMBUSTIBLE POR MEDIO DE CUPONES PARA EL ANO 2022 SEGUNDA VEZ', 'codigo' => 'LP-08/2022', 'resolucion' => '504', 'inicio' => '2022-04-06', 'fin' => '2022-12-31', 'monto' => 144.00],
            ['id' => 84, 'proveedor_id' => 20, 'numero' => '30/2021', 'nombre' => '2021 - SUMINISTRO DE COMBUSTIBLE POR MEDIO DE CUPONES', 'codigo' => '70/2021', 'resolucion' => '1230', 'inicio' => '2021-09-16', 'fin' => '2021-12-31', 'monto' => 44000.00],
            ['id' => 74, 'proveedor_id' => 20, 'numero' => 'OC-000017/2021', 'nombre' => '2021 - SUMINISTRO DE COMBUSTIBLE POR MEDIO DE CUPONES', 'codigo' => 'LG-16/2021', 'resolucion' => '2885', 'inicio' => '2021-04-06', 'fin' => '2021-04-30', 'monto' => 40000.00],
        ];

        // Cacheamos los IDs de proveedores que realmente existen en el sistema nuevo
        $proveedoresExistentes = DB::table('proveedores')->pluck('id')->toArray();

        foreach ($contratos as $contrato) {
            $activo = $contrato['fin'] >= $hoyStr;
            $montoInicial = $contrato['monto'] ?? 0.00;

            // Validar que el proveedor exista para no romper integridad referencial
            $proveedorId = in_array($contrato['proveedor_id'], $proveedoresExistentes) 
                ? $contrato['proveedor_id'] 
                : null;

            if (array_key_exists('saldo_actual', $contrato) && $contrato['saldo_actual'] !== null) {
                $montoDisponible = $contrato['saldo_actual'];
            } else {
                $montoDisponible = $activo ? $montoInicial : 0.00;
            }

            $observaciones = array_filter([
                'Migrado desde contratos historicos de transporte.',
                "con_id legado: {$contrato['id']}.",
                "con_id_prv legado: {$contrato['proveedor_id']}." . ($proveedorId === null ? ' (No encontrado en tabla proveedores nueva)' : ''),
                'Institucion: ASAMBLEA LEGISLATIVA DE EL SALVADOR.',
                "Codigo: {$contrato['codigo']}.",
                "Resolucion: {$contrato['resolucion']}.",
                $contrato['monto'] === null ? 'Monto no especificado en origen; se registra 0.00 por restriccion del esquema.' : null,
                $activo ? 'Contrato vigente al momento de la migracion; se requiere verificar saldos consumidos.' : 'Contrato vencido al momento de la migracion; monto_disponible inicializado en 0.00.',
                $contrato['nota'] ?? null,
            ]);

            DB::table('contrato_combustibles')->updateOrInsert(
                ['id' => $contrato['id']],
                [
                    'proveedor_id' => $proveedorId, // Sin nulos por defecto
                    'numero_contrato' => $contrato['numero'],
                    'nombre' => $contrato['nombre'],
                    'monto_inicial' => $montoInicial,
                    'monto_disponible' => $montoDisponible,
                    'fecha_inicio' => $contrato['inicio'],
                    'fecha_fin' => $contrato['fin'],
                    'activo' => $activo,
                    'observaciones' => implode("\n", $observaciones),
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );
        }
        
        // Descomentar si usas PostgreSQL:
        // DB::statement("SELECT setval(pg_get_serial_sequence('contrato_combustibles', 'id'), coalesce(max(id), 1)) FROM contrato_combustibles;");
    }
}