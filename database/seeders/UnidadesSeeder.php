<?php

namespace Database\Seeders;

use App\Models\UnidadSolicitante;
use Illuminate\Database\Seeder;

class UnidadesSeeder extends Seeder
{
    public function run(): void
    {
        $unidades = [
            // 01 - DIRECCION Y ADMINISTRACION INSTITUCIONAL
            ['codigo' => '01',      'nombre' => 'DIRECCION Y ADMINISTRACION INSTITUCIONAL',      'siglas' => 'RRHH', 'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '0101',    'nombre' => 'DIRECCIÓN SUPERIOR',                             'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '010101',  'nombre' => 'JUNTA DIRECTIVA',                               'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '01010101', 'nombre' => 'PRESIDENCIA',                                   'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '01010102', 'nombre' => 'PRIMER VICEPRESIDENCIA',                        'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '01010103', 'nombre' => 'SEGUNDA VICEPRESIDENCIA',                       'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '01010104', 'nombre' => 'TERCERA VICEPRESIDENCIA',                       'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '01010105', 'nombre' => 'PRIMER SECRETARIA',                             'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '01010106', 'nombre' => 'SEGUNDA SECRETARIA',                            'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '01010107', 'nombre' => 'TERCERA SECRETARIA',                            'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '01010108', 'nombre' => 'CUARTA SECRETARIA',                             'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '010102',  'nombre' => 'GRUPOS PARLAMENTARIOS',                         'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '01010201', 'nombre' => 'GRUPO PARLAMENTARIO ARENA',                     'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '01010202', 'nombre' => 'GRUPO PARLAMENTARIO FMLN',                      'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '01010203', 'nombre' => 'GRUPO PARLAMENTARIO GANA',                      'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '01010204', 'nombre' => 'GRUPO PARLAMENTARIO PCN',                       'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '01010205', 'nombre' => 'GRUPO PARLAMENTARIO PDC',                       'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '01010206', 'nombre' => 'GRUPO PARLAMENTARIO NUEVAS IDEAS',              'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '01010207', 'nombre' => 'GRUPO PARLAMENTARIO NUESTRO TIEMPO',            'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '01010208', 'nombre' => 'GRUPO PARLAMENTARIO VAMOS',                     'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '01010209', 'nombre' => 'DIP. CARLOS ARMANDO REYES RAMOS',               'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '01010210', 'nombre' => 'DIP. JORGE LUIS ROSALES RÍOS',                  'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '01010211', 'nombre' => 'DIP. DONATO EUGENIO VAQUERANO RIVAS',           'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '010103',  'nombre' => 'UNIDADES DEPENDIENTES DE JUNTA DIRECTIVA',      'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '01010301', 'nombre' => 'DIRECCIÓN GENERAL DE PROTOCOLO Y RELACIONES INTERNACIONALES', 'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '01010302', 'nombre' => 'UNIDAD DE ADQUISICIONES Y CONTRATACIONES INSTITUCIONALES',    'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '01010303', 'nombre' => 'UNIDAD DE ACCESO A LA INFORMACION PÚBLICA',     'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '01010304', 'nombre' => 'UNIDAD DE AUDITORÍA INTERNA',                   'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '01010305', 'nombre' => 'UNIDAD DE GÉNERO',                              'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '01010306', 'nombre' => 'UNIDAD DE SEGURIDAD',                            'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '0102',    'nombre' => 'ADMINISTRACIÓN DE RECURSOS HUMANOS',             'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '010201',  'nombre' => 'GERENCIA DE RECURSOS HUMANOS',                  'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '01020101', 'nombre' => 'SUB GERENCIA DE RECURSOS HUMANOS',              'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '010202',  'nombre' => 'DEPARTAMENTO DE OPERACIONES ADMINISTRATIVAS',   'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '010203',  'nombre' => 'DEPARTAMENTO DE PRESTACIONES Y BENEFICIOS',     'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '010204',  'nombre' => 'CLÍNICA MÉDICA Y PSICOLÓGICA',                  'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '010205',  'nombre' => 'DEPARTAMENTO DE CULTURA Y DEPORTES',            'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '010206',  'nombre' => 'DEPARTAMENTO DE CAPACITACIÓN',                  'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '0103',    'nombre' => 'ADMINISTRACIÓN FINANCIERA INSTITUCIONAL',       'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '010301',  'nombre' => 'GERENCIA DE ADMINISTRACIÓN Y FINANZAS',         'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '01030101', 'nombre' => 'SUB GERENCIA DE ADMINISTRACIÓN Y FINANZAS',     'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '010302',  'nombre' => 'DEPARTAMENTO DE PRESUPUESTO',                   'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '010303',  'nombre' => 'DEPARTAMENTO DE TESORERÍA',                     'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '010304',  'nombre' => 'DEPARTAMENTO DE CONTABILIDAD',                  'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '010305',  'nombre' => 'DEPARTAMENTO DE PLANIFICACIÓN',                 'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '010306',  'nombre' => 'DEPARTAMENTO DE SISTEMAS',                      'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '010307',  'nombre' => 'DEPARTAMENTO DE TRANSPORTE',                    'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '010308',  'nombre' => 'DEPARTAMENTO DE ACTIVO FIJO',                   'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '010309',  'nombre' => 'DEPARTAMENTO DE SERVICIOS GENERALES',           'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '010310',  'nombre' => 'DEPARTAMENTO DE ALMACÉN',                       'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '0104',    'nombre' => 'COMUNICACIONES',                                'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '010401',  'nombre' => 'GERENCIA DE COMUNICACIONES',                    'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '01040101', 'nombre' => 'SUB GERENCIA ADMINISTRATIVA',                   'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '010402',  'nombre' => 'DEPARTAMENTO DE PRENSA',                        'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '010403',  'nombre' => 'DEPARTAMENTO DE AUDIOVISUALES',                 'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '010404',  'nombre' => 'DEPARTAMENTO DE DISEÑO GRÁFICO',                'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '010405',  'nombre' => 'DEPARTAMENTO DE TELEVISIÓN',                    'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '010406',  'nombre' => 'DEPARTAMENTO DE RADIO',                         'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '010407',  'nombre' => 'DEPARTAMENTO DE COMUNICACIÓN INTERNA',          'estado' => true, 'puede_solicitar_transporte' => true],

            // 02 - LEGISLACION
            ['codigo' => '02',      'nombre' => 'LEGISLACION',                                  'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '0201',    'nombre' => 'PLENO',                                         'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '020101',  'nombre' => 'GERENCIA DE OPERACIONES LEGISLATIVAS',         'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '020102',  'nombre' => 'DEPARTAMENTO DE ASESORÍA TÉCNICA LEGISLATIVA', 'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '020103',  'nombre' => 'DEPARTAMENTO DE ÍNDICE LEGISLATIVO',           'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '020104',  'nombre' => 'DEPARTAMENTO DE ANÁLISIS LEGISLATIVO',         'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '020105',  'nombre' => 'DEPARTAMENTO DE ARCHIVO LEGISLATIVO',          'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '020106',  'nombre' => 'DEPARTAMENTO DE OPERACIONES LEGISLATIVAS Y SERVICIOS PARLAMENTARIOS', 'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '020107',  'nombre' => 'DEPARTAMENTO DE PASANTÍAS LEGISLATIVAS',       'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '020108',  'nombre' => 'DEPARTAMENTO DE OFICINAS DEPARTAMENTALES',     'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '02010801', 'nombre' => 'OFICINA DEPARTAMENTAL SAN SALVADOR',            'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '02010802', 'nombre' => 'OFICINA DEPARTAMENTAL CHALATENANGO',            'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '02010803', 'nombre' => 'OFICINA DEPARTAMENTAL SANTA ANA',               'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '02010804', 'nombre' => 'OFICINA DEPARTAMENTAL SAN MIGUEL',              'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '02010805', 'nombre' => 'OFICINA DEPARTAMENTAL LA PAZ',                  'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '02010806', 'nombre' => 'OFICINA DEPARTAMENTAL SAN VICENTE',             'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '02010807', 'nombre' => 'OFICINA DEPARTAMENTAL DE SONSONATE',            'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '02010808', 'nombre' => 'OFICINA DEPARTAMENTAL DE AHUACHAPÁN',           'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '02010809', 'nombre' => 'OFICINA DEPARTAMENTAL DE LA UNIÓN',             'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '02010810', 'nombre' => 'OFICINA DEPARTAMENTAL DE USULUTÁN',             'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '02010811', 'nombre' => 'OFICINA DEPARTAMENTAL DE MORAZÁN',              'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '02010812', 'nombre' => 'OFICINA DEPARTAMENTAL DE CABAÑAS',              'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '02010813', 'nombre' => 'OFICINA DEPARTAMENTAL DE CUSCATLÁN',            'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '02010814', 'nombre' => 'OFICINA DEPARTAMENTAL DE LA LIBERTAD',          'estado' => true, 'puede_solicitar_transporte' => true],

            // 03 - INFRAESTRUCTURA FISICA
            ['codigo' => '03',      'nombre' => 'INFRAESTRUCTURA FISICA',                       'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '0301',    'nombre' => 'CONSTRUCCIÓN Y REMODELACIÓN DE EDIFICIOS',     'estado' => true, 'puede_solicitar_transporte' => true],

            // 04 - MODERNIZACIÓN Y FORTALECIMIENTO INSTITUCIONAL
            ['codigo' => '04',      'nombre' => 'MODERNIZACIÓN Y FORTALECIMIENTO INSTITUCIONAL', 'estado' => true, 'puede_solicitar_transporte' => true],
            ['codigo' => '0401',    'nombre' => 'FINANCIAMIENTO AL PROGRAMA DE MODERNIZACIÓN(CONTRAPARTIDA', 'estado' => true, 'puede_solicitar_transporte' => true],
        ];

        foreach ($unidades as $unidad) {
            UnidadSolicitante::create($unidad);
        }
    }
}
