<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ContratosMantenimientoTransporteSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();
        $hoyStr = $now->toDateString();

        $contratos = [
            ['id' => 107, 'proveedor_id' => 18,  'numero' => '17/2026',                                   'nombre' => 'SERVICIO DE MANTENIMIENTO PREVENTIVO Y CORRECTIVO PARA VEHICULOS PARA EL ANO 2026',                                                                 'inicio' => '2026-02-11', 'fin' => '2026-12-31', 'monto' => 209000.00],
            ['id' => 104, 'proveedor_id' => 23,  'numero' => 'SIN-NUMERO-104',                             'nombre' => 'SUMINISTRO DE LLANTAS PARA VEHICULOS INSTITUCIONALES 2025',                                                                                    'inicio' => '2025-03-20', 'fin' => '2025-12-31', 'monto' => 9070.00],
            ['id' => 103, 'proveedor_id' => 22,  'numero' => 'SIN-NUMERO-103',                             'nombre' => 'SUMINISTRO DE LLANTAS PARA VEHICULOS INSTITUCIONALES 2025',                                                                                    'inicio' => '2025-03-20', 'fin' => '2025-12-31', 'monto' => 10497.69],
            ['id' => 86,  'proveedor_id' => 165, 'numero' => '130',                                        'nombre' => 'SUMINISTRO DE LLANTAS Y NEUMATICOS',                                                                                                           'inicio' => '2021-12-06', 'fin' => '2021-12-31', 'monto' => null],
            ['id' => 85,  'proveedor_id' => 168, 'numero' => '129',                                        'nombre' => 'SUMINISTRO DE LLANTAS Y NEUMATICOS',                                                                                                           'inicio' => '2021-12-06', 'fin' => '2021-12-31', 'monto' => null],
            ['id' => 101, 'proveedor_id' => 18,  'numero' => 'SIN-NUMERO-101',                             'nombre' => 'SERVICIO MANTENIMIENTO PREVENTIVO Y CORRECTIVO DE VEHICULOS, PARA EL ANO 2025',                                                              'inicio' => '2025-04-02', 'fin' => '2025-12-31', 'monto' => 209000.00],
            ['id' => 97,  'proveedor_id' => 18,  'numero' => '13/2023 (PRORROGA)',                         'nombre' => '(PRORROGA) SERVICIO DE MANTENIMIENTO PREVENTIVO Y CORRECTIVO DE VEHICULOS',                                                                     'inicio' => '2024-01-01', 'fin' => '2024-11-25', 'monto' => 0.00],
            ['id' => 96,  'proveedor_id' => 23,  'numero' => '18/2023',                                    'nombre' => 'SUMINISTRO DE LLANTAS Y NEUMATICOS PARA VEHICULOS INSTITUCIONALES',                                                                              'inicio' => '2023-05-31', 'fin' => '2023-12-31', 'monto' => 8710.00],
            ['id' => 95,  'proveedor_id' => 22,  'numero' => '17/2023',                                    'nombre' => 'SUMINISTRO DE LLANTAS Y NEUMATICOS PARA VEHICULOS INSTITUCIONALES',                                                                              'inicio' => '2023-05-31', 'fin' => '2023-12-31', 'monto' => 16164.00],
            ['id' => 93,  'proveedor_id' => 18,  'numero' => '13/2023',                                    'nombre' => 'SERVICIO DE MANTENIMIENTO PREVENTIVO Y CORRECTIVO DE VEHICULOS',                                                                                 'inicio' => '2023-02-07', 'fin' => '2023-12-31', 'monto' => 195000.00],
            ['id' => 89,  'proveedor_id' => 18,  'numero' => '30/2022',                                    'nombre' => 'SERVICIO DE MANTENIMIENTO PREVENTIVO Y CORRECTIVO DE VEHICULOS SEGUNDA VEZ',                                                                     'inicio' => '2022-03-28', 'fin' => '2022-12-31', 'monto' => 0.00],
            ['id' => 92,  'proveedor_id' => 23,  'numero' => 'LG-26/2022',                                 'nombre' => 'SUMINISTRO DE LLANTAS Y NEUMATICOS PARA VEHICULOS INSTITUCIONALES',                                                                              'inicio' => '2022-03-29', 'fin' => '2022-12-31', 'monto' => null],
            ['id' => 91,  'proveedor_id' => 22,  'numero' => '27/2022',                                    'nombre' => 'SUMINISTRO DE LLANTAS Y NEUMATICOS PARA VEHICULOS INSTITUCIONALES',                                                                              'inicio' => '2022-03-29', 'fin' => '2022-12-31', 'monto' => 0.00],
            ['id' => 88,  'proveedor_id' => 18,  'numero' => '53/2021',                                    'nombre' => 'SERVICIO DE MANTENIMIENTO PREVENTIVO Y CORRECTIVO DE VEHICULOS SEGUNDO PROCESO',                                                                 'inicio' => '2021-11-11', 'fin' => '2021-12-31', 'monto' => null],
            ['id' => 87,  'proveedor_id' => 169, 'numero' => '54/2021',                                    'nombre' => 'SERVICIO DE MANTENIMIENTO PREVENTIVO Y CORRECTIVO DE VEHICULOS SEGUNDO PROCESO',                                                                 'inicio' => '2021-11-12', 'fin' => '2021-12-31', 'monto' => 31203.88],
            ['id' => 83,  'proveedor_id' => 18,  'numero' => '37/2021',                                    'nombre' => 'SERVICIO DE MANTENIMIENTO PREVENTIVO DE VEHICULOS PARA LA ASAMBLEA LEGISLATIVA DE EL SALVADOR',                                                  'inicio' => '2021-10-20', 'fin' => '2021-12-31', 'monto' => 5423.40],
            ['id' => 82,  'proveedor_id' => 171, 'numero' => 'ADENDUM N 2 DEL CONTRATO N 26974',           'nombre' => 'POLIZA DE SEGURO DE AUTOMOTORES',                                                                                                                'inicio' => '2021-04-29', 'fin' => '2021-10-29', 'monto' => 55164.39],
            ['id' => 80,  'proveedor_id' => 18,  'numero' => '27042 -ITEM 4',                              'nombre' => 'SERVICIO DE MANTENIMIENTO PREVENTIVO CORRECTIVO DE VEHICULOS SIN GARANTIA DE FABRICA Y MOTOCICLETAS',                                            'inicio' => '2020-05-28', 'fin' => '2020-12-31', 'monto' => null],
            ['id' => 70,  'proveedor_id' => 18,  'numero' => '27042',                                      'nombre' => 'SERVICIO DE MANTENIMIENTO PREVENTIVO Y CORRECTIVO DE VEHICULOS SIN GARANTIA DE FABRICA',                                                          'inicio' => '2020-05-28', 'fin' => '2020-12-31', 'monto' => 103500.00],
            ['id' => 69,  'proveedor_id' => 23,  'numero' => '27041',                                      'nombre' => 'SUMINISTRO DE LLANTAS',                                                                                                                           'inicio' => '2020-05-28', 'fin' => '2020-12-31', 'monto' => 20000.00],
            ['id' => 72,  'proveedor_id' => 169, 'numero' => '16/2020',                                    'nombre' => 'SERV. DE MANTO. PREVENTIVO Y CORRECTIVO DE VEHS. QUE CUENTAN CON GARANTIA DE FABRICA MARCA NISSAN',                                              'inicio' => '2020-07-23', 'fin' => '2020-12-31', 'monto' => 7000.00],
            ['id' => 81,  'proveedor_id' => 18,  'numero' => 'ADENDUM N 1 DEL CONTRATO 27042 -ITEM 4',     'nombre' => 'SERVICIO DE MANTENIMIENTO PREVENTIVO Y CORRECTIVO DE MOTOCICLETAS',                                                                                'inicio' => '2021-01-01', 'fin' => '2021-04-30', 'monto' => 1500.00],
            ['id' => 78,  'proveedor_id' => 23,  'numero' => 'ADENDUM N 1 DEL CONTRATO - 27041',           'nombre' => 'SUMINISTRO DE LLANTAS',                                                                                                                           'inicio' => '2021-01-01', 'fin' => '2021-04-30', 'monto' => 10000.00],
            ['id' => 77,  'proveedor_id' => 18,  'numero' => 'ADENDUM N 1 DEL CONTRATO - 27042',           'nombre' => 'SERVICIO DE MANTENIMIENTO PREVENTIVO Y CORRECTIVO DE VEHICULOS SIN GARANTIA DE FABRICA',                                                          'inicio' => '2021-01-01', 'fin' => '2021-04-30', 'monto' => 58500.00],
            ['id' => 76,  'proveedor_id' => 169, 'numero' => 'PRORROGA CONTRATO 17/2020',                  'nombre' => 'SERVICIO DE MANTO. PREVENTIVO Y CORRECTIVO DE VEH. QUE CUENTAN CON GARANTIA DE FABRICA MARCA TOYOTA',                                             'inicio' => '2021-01-01', 'fin' => '2021-04-30', 'monto' => 7000.00],
            ['id' => 75,  'proveedor_id' => 1213, 'numero' => 'PRORROGA DE CONTRATO 16/2020',               'nombre' => 'GRUPO Q - PRORROGA CONTRATO SERVICIO DE MANTO. PREVENTIVO Y CORRECTIVO DE VEHS. QUE CUENTAN CON GAR',                                              'inicio' => '2021-01-01', 'fin' => '2021-04-30', 'monto' => 7000.00],
            ['id' => 79,  'proveedor_id' => 1146, 'numero' => '15/2020',                                    'nombre' => 'SERVICIO DE TRANSPORTE DE PERSONAL PARA LA ASAMBLEA LEGISLATIVA',                                                                                 'inicio' => '2020-07-08', 'fin' => '2020-12-31', 'monto' => 3500.00],
            ['id' => 73,  'proveedor_id' => 171, 'numero' => '26974',                                      'nombre' => 'POLIZA DE SEGUROS DE AUTOMOTORES',                                                                                                                'inicio' => '2020-03-31', 'fin' => '2021-03-31', 'monto' => 104999.60],
            ['id' => 71,  'proveedor_id' => 169, 'numero' => '17/2020',                                    'nombre' => 'SERV. DE MANTO. PREVENTIVO Y CORRECTIVO DE VEH. QUE CUENTAN CON GARANTIA DE FABRICA MARCA TOYOTA Y M',                                           'inicio' => '2020-07-23', 'fin' => '2020-12-31', 'monto' => 8000.00],
        ];

        $proveedoresExistentes = DB::table('proveedores')->pluck('id')->toArray();

        foreach ($contratos as $contrato) {
            $activo = $contrato['fin'] >= $hoyStr;
            $montoInicial = $contrato['monto'] ?? 0.00;

            $proveedorId = in_array($contrato['proveedor_id'], $proveedoresExistentes)
                ? $contrato['proveedor_id']
                : null;

            $montoDisponible = $activo ? $montoInicial : 0.00;

            $notas = [
                'Migrado desde contratos historicos de transporte.',
                "con_id legado: {$contrato['id']}.",
            ];

            if ($proveedorId === null) {
                $notas[] = "con_id_prv legado: {$contrato['proveedor_id']} (No encontrado en tabla proveedores nueva)";
            }

            if ($contrato['monto'] === null) {
                $notas[] = 'Monto no especificado en origen; se registra 0.00 por restriccion del esquema.';
            }

            if ($activo) {
                $notas[] = 'Contrato vigente al momento de la migracion; se requiere verificar saldos consumidos.';
            } else {
                $notas[] = 'Contrato vencido al momento de la migracion; monto_disponible inicializado en 0.00.';
            }

            DB::table('contratos_mantenimiento')->updateOrInsert(
                ['id' => $contrato['id']],
                [
                    'proveedor_id' => $proveedorId,
                    'numero_contrato' => $contrato['numero'],
                    'nombre' => $contrato['nombre'],
                    'monto_inicial' => $montoInicial,
                    'monto_disponible' => $montoDisponible,
                    'fecha_inicio' => $contrato['inicio'],
                    'fecha_fin' => $contrato['fin'],
                    'activo' => $activo,
                    'observaciones' => implode("\n", $notas),
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );
        }
    }
}
