<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ParametrosSistemaSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('parametros_sistema')->insertOrIgnore([
            ['id' => 1,  'codigo' => 'SYS_DIR',                              'nombre' => 'Dirección',                'tipo' => 'string', 'valor' => 'CENTRO DE GOBIERNO, SAN SALVADOR, EL SALVADOR, C. A.', 'valor_default' => '25 Calle Pte. y 25 Avenida Nte. Edificio Gazolo', 'es_sistema' => true],
            ['id' => 2,  'codigo' => 'SYS_PBX',                              'nombre' => 'PBX',                      'tipo' => 'string', 'valor' => 'PBX: (503) 2520-3888',                                  'valor_default' => 'PBX (503) 2521-2200',                            'es_sistema' => true],
            ['id' => 3,  'codigo' => 'SYS_WEB',                              'nombre' => 'Sitio Web',                'tipo' => 'string', 'valor' => 'www.asamblea.gob.sv',                                   'valor_default' => 'www.asamblea.gob.sv',                            'es_sistema' => true],
            ['id' => 4,  'codigo' => 'SYS_NIT',                              'nombre' => 'NIT',                      'tipo' => 'string', 'valor' => '0614-030596-102-5',                                     'valor_default' => '0614-030596-102-5',                              'es_sistema' => true],
            ['id' => 5,  'codigo' => 'SYS_SIGLAS',                           'nombre' => 'Siglas',                   'tipo' => 'string', 'valor' => 'DPTO. TRANSPORTE',                                     'valor_default' => 'GS',                                             'es_sistema' => true],
            ['id' => 6,  'codigo' => 'SYS_DOMICILIO',                        'nombre' => 'Domicilio',                'tipo' => 'string', 'valor' => 'San Salvador',                                         'valor_default' => 'San Salvador',                                   'es_sistema' => true],
            ['id' => 7,  'codigo' => 'SYS_EMPRESA',                          'nombre' => 'Nombre Empresa',           'tipo' => 'string', 'valor' => 'DEPARTAMENTO DE TRANSPORTE',                            'valor_default' => 'DEPARTAMENTO DE TRANSPORTE',                     'es_sistema' => true],
            ['id' => 8,  'codigo' => 'SYS_LOGOTIPO',                         'nombre' => 'Logotipo',                 'tipo' => 'string', 'valor' => 'logo_asamblea',                                        'valor_default' => 'logo_asamblea',                                  'es_sistema' => true],
            ['id' => 9,  'codigo' => 'NUMERO_DECIMALES',                     'nombre' => 'Número de decimales',      'tipo' => 'string', 'valor' => '2',                                                    'valor_default' => '4',                                              'es_sistema' => true],
            ['id' => 10, 'codigo' => 'CORREO_ADMIN',                         'nombre' => 'Correo administrador',     'tipo' => 'string', 'valor' => null,                                                   'valor_default' => null,                                             'es_sistema' => true],
            ['id' => 11, 'codigo' => 'SYS_TEL',                              'nombre' => 'Teléfono empresa',         'tipo' => 'string', 'valor' => '2281-9000',                                            'valor_default' => null,                                             'es_sistema' => true],
            ['id' => 12, 'codigo' => 'SYS_FAX',                              'nombre' => 'Número de fax',            'tipo' => 'string', 'valor' => '2281-9000',                                            'valor_default' => null,                                             'es_sistema' => true],
            ['id' => 13, 'codigo' => 'SYS_JEFE_TRANSPORTE',                  'nombre' => 'Nombre jefe de transporte', 'tipo' => 'string', 'valor' => null,                                                   'valor_default' => 'Jose Santos Escobar',                            'es_sistema' => true],
            ['id' => 14, 'codigo' => 'SYS_PUESTO_JEFE_TRANSPORTE',           'nombre' => 'Puesto jefe transporte',   'tipo' => 'string', 'valor' => 'JEFE DE TRANSPORTE',                                   'valor_default' => 'Jefe de transporte',                             'es_sistema' => true],
            ['id' => 15, 'codigo' => 'SYS_PERIODO_LEGISLATIVO',              'nombre' => 'Período legislatura',      'tipo' => 'string', 'valor' => null,                                                   'valor_default' => null,                                             'es_sistema' => true],
            ['id' => 16, 'codigo' => 'NUMERO_DIAS_PRODUCTOS_VENCIMIENTO',    'nombre' => 'Días alerta vencimiento',  'tipo' => 'string', 'valor' => '40',                                                   'valor_default' => '40',                                             'es_sistema' => true],
            ['id' => 17, 'codigo' => 'ULTIMO_TICKET',                        'nombre' => 'Último ticket generado',   'tipo' => 'string', 'valor' => '59696',                                              'valor_default' => '59696',                                          'es_sistema' => true],
        ]);
    }
}
