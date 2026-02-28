<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PaisesSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('paises')->insertOrIgnore([
            ['id' => 1,  'nombre' => 'EL SALVADOR',          'nacionalidad' => 'Salvadoreña',    'activo' => true],
            ['id' => 2,  'nombre' => 'BELICE',                'nacionalidad' => 'Beliceña',        'activo' => true],
            ['id' => 3,  'nombre' => 'COSTA RICA',            'nacionalidad' => 'Costarricense',   'activo' => true],
            ['id' => 4,  'nombre' => 'GUATEMALA',             'nacionalidad' => 'Guatemalteca',    'activo' => true],
            ['id' => 5,  'nombre' => 'HONDURAS',              'nacionalidad' => 'Hondureña',       'activo' => true],
            ['id' => 6,  'nombre' => 'NICARAGUA',             'nacionalidad' => 'Nicaragüense',    'activo' => true],
            ['id' => 7,  'nombre' => 'REPUBLICA DOMINICANA',  'nacionalidad' => 'Dominicana',      'activo' => true],
            ['id' => 8,  'nombre' => 'CANADA',                'nacionalidad' => 'Canadiense',      'activo' => true],
            ['id' => 9,  'nombre' => 'ESTADOS UNIDOS',        'nacionalidad' => 'Estadounidense',  'activo' => true],
            ['id' => 10, 'nombre' => 'COLOMBIA',              'nacionalidad' => 'Colombiana',      'activo' => true],
            ['id' => 11, 'nombre' => 'VENEZUELA',             'nacionalidad' => 'Venezolana',      'activo' => true],
            ['id' => 12, 'nombre' => 'PERÚ',                  'nacionalidad' => 'Peruana',         'activo' => true],
            ['id' => 13, 'nombre' => 'ECUADOR',               'nacionalidad' => 'Ecuatoriana',     'activo' => true],
            ['id' => 14, 'nombre' => 'CHILE',                 'nacionalidad' => 'Chilena',         'activo' => true],
            ['id' => 15, 'nombre' => 'BOLIVIANA',             'nacionalidad' => 'Boliviana',       'activo' => true],
            ['id' => 16, 'nombre' => 'BRASIL',                'nacionalidad' => 'Brasileña',       'activo' => true],
            ['id' => 17, 'nombre' => 'ARGENTINA',             'nacionalidad' => 'Argentina',       'activo' => true],
            ['id' => 18, 'nombre' => 'PARAGUAY',              'nacionalidad' => 'Paraguaya',       'activo' => true],
            ['id' => 19, 'nombre' => 'CUBA',                  'nacionalidad' => 'Cubana',          'activo' => true],
            ['id' => 20, 'nombre' => 'HAITÍ',                 'nacionalidad' => 'Haitiana',        'activo' => true],
            ['id' => 21, 'nombre' => 'SANTO DOMINGO',         'nacionalidad' => 'Santodomingueña', 'activo' => true],
            ['id' => 22, 'nombre' => 'ESPAÑA',                'nacionalidad' => 'Española',        'activo' => true],
            ['id' => 23, 'nombre' => 'INGLATERRA',            'nacionalidad' => 'Inglesa',         'activo' => true],
            ['id' => 24, 'nombre' => 'PORTUGAL',              'nacionalidad' => 'Portuguesa',      'activo' => true],
            ['id' => 25, 'nombre' => 'FRANCIA',               'nacionalidad' => 'Francesa',        'activo' => true],
            ['id' => 26, 'nombre' => 'HOLANDA',               'nacionalidad' => 'Holandesa',       'activo' => true],
            ['id' => 27, 'nombre' => 'GRECIA',                'nacionalidad' => 'Griega',          'activo' => true],
            ['id' => 28, 'nombre' => 'ITALIA',                'nacionalidad' => 'Italiana',        'activo' => true],
            ['id' => 29, 'nombre' => 'TURQUÍA',               'nacionalidad' => 'Turca',           'activo' => true],
            ['id' => 30, 'nombre' => 'SIRIA',                 'nacionalidad' => 'Siria',           'activo' => true],
            ['id' => 31, 'nombre' => 'RUSIA',                 'nacionalidad' => 'Rusa',            'activo' => true],
            ['id' => 32, 'nombre' => 'CHINA',                 'nacionalidad' => 'China',           'activo' => true],
            ['id' => 33, 'nombre' => 'JAPÓN',                 'nacionalidad' => 'Japonesa',        'activo' => true],
            ['id' => 34, 'nombre' => 'INDIA',                 'nacionalidad' => 'India',           'activo' => true],
            ['id' => 35, 'nombre' => 'EGIPTO',                'nacionalidad' => 'Egipcia',         'activo' => true],
            ['id' => 36, 'nombre' => 'PAKISTAN',              'nacionalidad' => 'Pakistaní',       'activo' => true],
            ['id' => 37, 'nombre' => 'IRAQ',                  'nacionalidad' => 'Iraquí',          'activo' => true],
            ['id' => 38, 'nombre' => 'ISRAEL',                'nacionalidad' => 'Israelí',         'activo' => true],
            ['id' => 39, 'nombre' => 'AUSTRALIA',             'nacionalidad' => 'Australiana',     'activo' => true],
            ['id' => 40, 'nombre' => 'MONGOLIA',              'nacionalidad' => 'Mongolés',        'activo' => true],
            ['id' => 41, 'nombre' => 'ARMENIA',               'nacionalidad' => 'Armenia',         'activo' => true],
            ['id' => 42, 'nombre' => 'GHANA',                 'nacionalidad' => 'Ghanés',          'activo' => true],
            ['id' => 43, 'nombre' => 'INDONESIA',             'nacionalidad' => 'Indonés',         'activo' => true],
            ['id' => 44, 'nombre' => 'SUIZA',                 'nacionalidad' => null,              'activo' => true],
            ['id' => 45, 'nombre' => 'BANGLADESH',            'nacionalidad' => 'Bangladeshi',     'activo' => true],
            ['id' => 46, 'nombre' => 'DESCONOCIDO',           'nacionalidad' => 'Desconocido',     'activo' => true],
            ['id' => 47, 'nombre' => 'ARABIA SAUDITA',        'nacionalidad' => 'Arabe',           'activo' => true],
            ['id' => 48, 'nombre' => 'ALEMANIA',              'nacionalidad' => 'Alemana',         'activo' => true],
        ]);
    }
}