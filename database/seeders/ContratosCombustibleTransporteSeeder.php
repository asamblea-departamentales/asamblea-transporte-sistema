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
            ['id' => 107, 'proveedor_id' => 18, 'numero' => '17/2026', 'nombre' => 'SERVICIO DE MANTENIMIENTO PREVENTIVO Y CORRECTIVO PARA VEHICULOS PARA EL ANO 2026', 'codigo' => 'LC-05/2026', 'resolucion' => 'LC-05/2026', 'inicio' => '2026-02-11', 'fin' => '2026-12-31', 'monto' => 209000.00, 'saldo_actual' => null],
            ['id' => 106, 'proveedor_id' => 20, 'numero' => '13/2025-ID106', 'nombre' => 'SEGUNDO SUMINISTRO DE TARJETAS ELECTRONICAS PARA COMBUSTIBLE', 'codigo' => '2025-04-01', 'resolucion' => '2025-04-01', 'inicio' => '2025-09-04', 'fin' => '2026-04-23', 'monto' => 69995.00, 'nota' => 'Numero original 13/2025 desambiguado por duplicidad con con_id=102.'],
            ['id' => 102, 'proveedor_id' => 20, 'numero' => '13/2025-ID102', 'nombre' => 'SUMINISTRO DE TARJETAS ELECTRONICAS PARA COMBUSTIBLE 2025', 'codigo' => '2025-04-01', 'resolucion' => '2025-04-01', 'inicio' => '2025-04-09', 'fin' => '2025-12-31', 'monto' => 110005.00, 'nota' => 'Numero original 13/2025 desambiguado por duplicidad con con_id=106.'],
            ['id' => 104, 'proveedor_id' => 23, 'numero' => 'SIN-NUMERO-104', 'nombre' => 'SUMINISTRO DE LLANTAS PARA VEHICULOS INSTITUCIONALES 2025', 'codigo' => 'CP-09/2025', 'resolucion' => 'CP-09/2025', 'inicio' => '2025-03-20', 'fin' => '2025-12-31', 'monto' => 9070.00, 'nota' => 'Numero de contrato no disponible en sistema origen; venia como fecha 2025-04-01.'],
            ['id' => 103, 'proveedor_id' => 22, 'numero' => 'SIN-NUMERO-103', 'nombre' => 'SUMINISTRO DE LLANTAS PARA VEHICULOS INSTITUCIONALES 2025', 'codigo' => 'CP-09/2025', 'resolucion' => 'CP-09/2025', 'inicio' => '2025-03-20', 'fin' => '2025-12-31', 'monto' => 10497.69, 'nota' => 'Numero de contrato no disponible en sistema origen; venia como fecha 2025-05-01.'],
            ['id' => 86, 'proveedor_id' => 165, 'numero' => '130', 'nombre' => 'SUMINISTRO DE LLANTAS Y NEUMATICOS', 'codigo' => '99-2021', 'resolucion' => '130', 'inicio' => '2021-12-06', 'fin' => '2021-12-31', 'monto' => null],
            ['id' => 85, 'proveedor_id' => 168, 'numero' => '129', 'nombre' => 'SUMINISTRO DE LLANTAS Y NEUMATICOS', 'codigo' => '99-2021', 'resolucion' => '129', 'inicio' => '2021-12-06', 'fin' => '2021-12-31', 'monto' => null],
            ['id' => 101, 'proveedor_id' => 18, 'numero' => 'SIN-NUMERO-101', 'nombre' => 'SERVICIO MANTENIMIENTO PREVENTIVO Y CORRECTIVO DE VEHICULOS, PARA EL ANO 2025', 'codigo' => '2025-03-01', 'resolucion' => '2025-09-01', 'inicio' => '2025-04-02', 'fin' => '2025-12-31', 'monto' => 209000.00, 'nota' => 'Numero de contrato no disponible en sistema origen; venia como fecha 2025-09-01.'],
            ['id' => 99, 'proveedor_id' => 20, 'numero' => 'SUMINISTRO DE COMBUSTIBLE', 'nombre' => 'SUMINISTRO DE COMBUSTIBLE NUMERO 2 POR MEDIO DE CUPONES PARA EL ANO 2024', 'codigo' => '1266', 'resolucion' => '1266', 'inicio' => '2024-08-20', 'fin' => '2024-12-31', 'monto' => null],
            ['id' => 100, 'proveedor_id' => 20, 'numero' => '11/2023 (PRORROGA)', 'nombre' => 'ENTREGA FINAL DE SUMINISTRO DE COMBUSTIBLE POR MEDIO DE CUPONES PARA EL ANO 2024', 'codigo' => '1266', 'resolucion' => '1266', 'inicio' => '2024-08-20', 'fin' => '2024-12-31', 'monto' => null],
            ['id' => 98, 'proveedor_id' => 20, 'numero' => '2024-SUMINISTRO DE COMBUSTIBLE POR MEDIO DE CUPONES O EQUIVALENTE', 'nombre' => 'SUMINISTRO DE COMBUSTIBLE POR MEDIO DE CUPONES PARA EL ANO 2024', 'codigo' => '1266', 'resolucion' => '1266', 'inicio' => '2024-01-01', 'fin' => '2024-12-28', 'monto' => null],
            ['id' => 97, 'proveedor_id' => 18, 'numero' => '13/2023 (PRORROGA)', 'nombre' => '(PRORROGA) SERVICIO DE MANTENIMIENTO PREVENTIVO Y CORRECTIVO DE VEHICULOS', 'codigo' => 'LP 05/2023', 'resolucion' => '13/2023', 'inicio' => '2024-01-01', 'fin' => '2024-11-25', 'monto' => 0.00],
            ['id' => 96, 'proveedor_id' => 23, 'numero' => '18/2023', 'nombre' => 'SUMINISTRO DE LLANTAS Y NEUMATICOS PARA VEHICULOS INSTITUCIONALES', 'codigo' => 'LG-05/2023', 'resolucion' => 'RA/186/LG/05/2023', 'inicio' => '2023-05-31', 'fin' => '2023-12-31', 'monto' => 8710.00],
            ['id' => 95, 'proveedor_id' => 22, 'numero' => '17/2023', 'nombre' => 'SUMINISTRO DE LLANTAS Y NEUMATICOS PARA VEHICULOS INSTITUCIONALES', 'codigo' => 'LG-17/2023', 'resolucion' => 'RA/186/LG/05/2023', 'inicio' => '2023-05-31', 'fin' => '2023-12-31', 'monto' => 16164.00],
            ['id' => 94, 'proveedor_id' => 20, 'numero' => 'SIN-NUMERO-94', 'nombre' => 'SUMINISTRO DE COMBUSTIBLE POR MEDIO DE CUPONES PARA EL ANO 2023', 'codigo' => '862', 'resolucion' => '2023-04-01', 'inicio' => '2023-02-16', 'fin' => '2023-12-31', 'monto' => 180000.00, 'nota' => 'Numero de contrato no disponible en sistema origen; venia como fecha 2023-11-01.'],
            ['id' => 93, 'proveedor_id' => 18, 'numero' => '13/2023', 'nombre' => 'SERVICIO DE MANTENIMIENTO PREVENTIVO Y CORRECTIVO DE VEHICULOS', 'codigo' => 'LP-05/2023', 'resolucion' => 'LP-05/2023', 'inicio' => '2023-02-07', 'fin' => '2023-12-31', 'monto' => 195000.00],
            ['id' => 90, 'proveedor_id' => 20, 'numero' => '31/2022', 'nombre' => 'SUMINISTRO DE COMBUSTIBLE POR MEDIO DE CUPONES PARA EL ANO 2022 SEGUNDA VEZ', 'codigo' => 'LP-08/2022', 'resolucion' => '504', 'inicio' => '2022-04-06', 'fin' => '2022-12-31', 'monto' => 144.00],
            ['id' => 89, 'proveedor_id' => 18, 'numero' => '30/2022', 'nombre' => 'SERVICIO DE MANTENIMIENTO PREVENTIVO Y CORRECTIVO DE VEHICULOS SEGUNDA VEZ', 'codigo' => 'LP-09/2022', 'resolucion' => '30/2022', 'inicio' => '2022-03-28', 'fin' => '2022-12-31', 'monto' => 0.00],
            ['id' => 92, 'proveedor_id' => 23, 'numero' => 'LG-26/2022', 'nombre' => 'SUMINISTRO DE LLANTAS Y NEUMATICOS PARA VEHICULOS INSTITUCIONALES', 'codigo' => 'LG 19/2022', 'resolucion' => 'UACI-346/2022', 'inicio' => '2022-03-29', 'fin' => '2022-12-31', 'monto' => null],
            ['id' => 91, 'proveedor_id' => 22, 'numero' => '27/2022', 'nombre' => 'SUMINISTRO DE LLANTAS Y NEUMATICOS PARA VEHICULOS INSTITUCIONALES', 'codigo' => 'LG 19/2022', 'resolucion' => 'UACI-348/2022', 'inicio' => '2022-03-29', 'fin' => '2022-12-31', 'monto' => 0.00],
            ['id' => 88, 'proveedor_id' => 18, 'numero' => '53/2021', 'nombre' => 'SERVICIO DE MANTENIMIENTO PREVENTIVO Y CORRECTIVO DE VEHICULOS SEGUNDO PROCESO', 'codigo' => 'LG-84/2021', 'resolucion' => '284', 'inicio' => '2021-11-11', 'fin' => '2021-12-31', 'monto' => null],
            ['id' => 87, 'proveedor_id' => 169, 'numero' => '54/2021', 'nombre' => 'SERVICIO DE MANTENIMIENTO PREVENTIVO Y CORRECTIVO DE VEHICULOS SEGUNDO PROCESO', 'codigo' => 'LG-84/2021', 'resolucion' => '284', 'inicio' => '2021-11-12', 'fin' => '2021-12-31', 'monto' => 31203.88],
            ['id' => 84, 'proveedor_id' => 20, 'numero' => '30/2021', 'nombre' => '2021 - SUMINISTRO DE COMBUSTIBLE POR MEDIO DE CUPONES', 'codigo' => '70/2021', 'resolucion' => '1230', 'inicio' => '2021-09-16', 'fin' => '2021-12-31', 'monto' => 44000.00],
            ['id' => 83, 'proveedor_id' => 18, 'numero' => '37/2021', 'nombre' => 'SERVICIO DE MANTENIMIENTO PREVENTIVO DE VEHICULOS PARA LA ASAMBLEA LEGISLATIVA DE EL SALVADOR', 'codigo' => 'CD-06/2021', 'resolucion' => '1230', 'inicio' => '2021-10-20', 'fin' => '2021-12-31', 'monto' => 5423.40],
            ['id' => 82, 'proveedor_id' => 171, 'numero' => 'ADENDUM N 2 DEL CONTRATO N 26974', 'nombre' => 'POLIZA DE SEGURO DE AUTOMOTORES', 'codigo' => '44/2020', 'resolucion' => 'No especificado', 'inicio' => '2021-04-29', 'fin' => '2021-10-29', 'monto' => 55164.39],
            ['id' => 80, 'proveedor_id' => 18, 'numero' => '27042 -ITEM 4', 'nombre' => 'SERVICIO DE MANTENIMIENTO PREVENTIVO CORRECTIVO DE VEHICULOS SIN GARANTIA DE FABRICA Y MOTOCICLETAS', 'codigo' => 'BOLPROS 51/2020', 'resolucion' => 'No especificado', 'inicio' => '2020-05-28', 'fin' => '2020-12-31', 'monto' => null],
            ['id' => 70, 'proveedor_id' => 18, 'numero' => '27042', 'nombre' => 'SERVICIO DE MANTENIMIENTO PREVENTIVO Y CORRECTIVO DE VEHICULOS SIN GARANTIA DE FABRICA', 'codigo' => 'BOLPROS-51/2020', 'resolucion' => 'No especificado', 'inicio' => '2020-05-28', 'fin' => '2020-12-31', 'monto' => 103500.00],
            ['id' => 69, 'proveedor_id' => 23, 'numero' => '27041', 'nombre' => 'SUMINISTRO DE LLANTAS', 'codigo' => 'BOLPROS-51/2020', 'resolucion' => 'No especificado', 'inicio' => '2020-05-28', 'fin' => '2020-12-31', 'monto' => 20000.00],
            ['id' => 72, 'proveedor_id' => 169, 'numero' => '16/2020', 'nombre' => 'SERV. DE MANTO. PREVENTIVO Y CORRECTIVO DE VEHS. QUE CUENTAN CON GARANTIA DE FABRICA MARCA NISSAN', 'codigo' => 'LG-57/2020', 'resolucion' => '2301', 'inicio' => '2020-07-23', 'fin' => '2020-12-31', 'monto' => 7000.00],
            ['id' => 81, 'proveedor_id' => 18, 'numero' => 'ADENDUM N 1 DEL CONTRATO 27042 -ITEM 4', 'nombre' => 'SERVICIO DE MANTENIMIENTO PREVENTIVO Y CORRECTIVO DE MOTOCICLETAS', 'codigo' => 'BOLPROS 51/2020', 'resolucion' => 'NO APLICA', 'inicio' => '2021-01-01', 'fin' => '2021-04-30', 'monto' => 1500.00],
            ['id' => 78, 'proveedor_id' => 23, 'numero' => 'ADENDUM N 1 DEL CONTRATO - 27041', 'nombre' => 'SUMINISTRO DE LLANTAS', 'codigo' => 'BOLPROS - 51/2020', 'resolucion' => 'NO APLICA', 'inicio' => '2021-01-01', 'fin' => '2021-04-30', 'monto' => 10000.00],
            ['id' => 77, 'proveedor_id' => 18, 'numero' => 'ADENDUM N 1 DEL CONTRATO - 27042', 'nombre' => 'SERVICIO DE MANTENIMIENTO PREVENTIVO Y CORRECTIVO DE VEHICULOS SIN GARANTIA DE FABRICA', 'codigo' => 'BOLPROS - 51/2020', 'resolucion' => 'No especificado', 'inicio' => '2021-01-01', 'fin' => '2021-04-30', 'monto' => 58500.00],
            ['id' => 76, 'proveedor_id' => 169, 'numero' => 'PRORROGA CONTRATO 17/2020', 'nombre' => 'SERVICIO DE MANTO. PREVENTIVO Y CORRECTIVO DE VEH. QUE CUENTAN CON GARANTIA DE FABRICA MARCA TOYOTA', 'codigo' => 'LG-58/2020', 'resolucion' => '2610', 'inicio' => '2021-01-01', 'fin' => '2021-04-30', 'monto' => 7000.00],
            ['id' => 75, 'proveedor_id' => 1213, 'numero' => 'PRORROGA DE CONTRATO 16/2020', 'nombre' => 'GRUPO Q - PRORROGA CONTRATO SERVICIO DE MANTO. PREVENTIVO Y CORRECTIVO DE VEHS. QUE CUENTAN CON GAR', 'codigo' => 'LG-57/2020', 'resolucion' => '2610', 'inicio' => '2021-01-01', 'fin' => '2021-04-30', 'monto' => 7000.00],
            ['id' => 79, 'proveedor_id' => 1146, 'numero' => '15/2020', 'nombre' => 'SERVICIO DE TRANSPORTE DE PERSONAL PARA LA ASAMBLEA LEGISLATIVA', 'codigo' => 'LG-57/2020', 'resolucion' => '2228', 'inicio' => '2020-07-08', 'fin' => '2020-12-31', 'monto' => 3500.00],
            ['id' => 73, 'proveedor_id' => 171, 'numero' => '26974', 'nombre' => 'POLIZA DE SEGUROS DE AUTOMOTORES', 'codigo' => 'BOLPROS-44/2020', 'resolucion' => '26974', 'inicio' => '2020-03-31', 'fin' => '2021-03-31', 'monto' => 104999.60],
            ['id' => 71, 'proveedor_id' => 169, 'numero' => '17/2020', 'nombre' => 'SERV. DE MANTO. PREVENTIVO Y CORRECTIVO DE VEH. QUE CUENTAN CON GARANTIA DE FABRICA MARCA TOYOTA Y M', 'codigo' => 'LG-58/2020', 'resolucion' => '2301', 'inicio' => '2020-07-23', 'fin' => '2020-12-31', 'monto' => 8000.00],
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