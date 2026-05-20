<?php

namespace Tests\Unit;

use App\Domain\Solicitudes\Enums\NivelPrioridadEnum;
use App\Models\Grupo;
use App\Models\SolicitudCombustible;
use App\Models\SolicitudTransporte;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SistemaGruposPrioridadesTest extends TestCase
{
    use RefreshDatabase;

    // ----- TEST GRUPO MODEL -----

    public function test_grupo_se_crea_con_todos_los_campos()
    {
        $grupo = Grupo::create([
            'nombre' => 'Presidencia',
            'descripcion' => 'Grupo de presidencia',
            'nivel_prioridad' => 'critica',
            'orden' => 1,
            'activo' => true,
        ]);

        $this->assertDatabaseHas('grupos', [
            'nombre' => 'Presidencia',
            'nivel_prioridad' => 'critica',
            'orden' => 1,
            'activo' => true,
        ]);
    }

    public function test_grupo_activos_returns_solo_grupos_activos()
    {
        Grupo::create(['nombre' => 'Activo 1', 'nivel_prioridad' => 'alta', 'orden' => 1, 'activo' => true]);
        Grupo::create(['nombre' => 'Inactivo', 'nivel_prioridad' => 'baja', 'orden' => 2, 'activo' => false]);
        Grupo::create(['nombre' => 'Activo 2', 'nivel_prioridad' => 'media', 'orden' => 3, 'activo' => true]);

        $activos = Grupo::activos();

        $this->assertCount(2, $activos);
        $this->assertTrue($activos->every(fn ($g) => $g->activo));
    }

    public function test_grupo_nivelEnum_returns_correct_enum()
    {
        $grupo = Grupo::create([
            'nombre' => 'Test',
            'nivel_prioridad' => 'alta',
            'orden' => 1,
            'activo' => true,
        ]);

        $enum = $grupo->nivelEnum();
        $this->assertInstanceOf(NivelPrioridadEnum::class, $enum);
        $this->assertEquals(NivelPrioridadEnum::ALTA, $enum);
    }

    public function test_grupo_label_returns_correct_label()
    {
        $grupo = Grupo::create([
            'nombre' => 'Test',
            'nivel_prioridad' => 'critica',
            'orden' => 1,
            'activo' => true,
        ]);

        $this->assertEquals('Crítica', $grupo->label());
    }

    public function test_grupo_color_returns_correct_color()
    {
        $grupo = Grupo::create([
            'nombre' => 'Test',
            'nivel_prioridad' => 'alta',
            'orden' => 1,
            'activo' => true,
        ]);

        $this->assertEquals('warning', $grupo->color());
    }

    // ----- TEST USER - GRUPO RELATIONSHIP -----

    public function test_user_pertenece_a_grupo()
    {
        $grupo = Grupo::create([
            'nombre' => 'Test Grupo',
            'nivel_prioridad' => 'media',
            'orden' => 1,
            'activo' => true,
        ]);

        $user = User::create([
            'name' => 'Test User',
            'email' => 'test' . uniqid() . '@example.com',
            'password' => 'password',
            'grupo_id' => $grupo->id,
        ]);

        // Reload the user with the relationship loaded
        $user = User::with('grupo')->find($user->id);
        $this->assertNotNull($user->grupo);
        $this->assertEquals($grupo->id, $user->grupo->id);
    }

    public function test_user_getPriorityLabel_returns_grupo_label()
    {
        $grupo = Grupo::create([
            'nombre' => 'Test',
            'nivel_prioridad' => 'alta',
            'orden' => 1,
            'activo' => true,
        ]);

        $user = User::create([
            'name' => 'Test',
            'email' => 'test' . uniqid() . '@example.com',
            'password' => 'password',
            'grupo_id' => $grupo->id,
        ]);

        // Reload the user with the relationship loaded
        $user = User::with('grupo')->find($user->id);
        $this->assertEquals('Alta', $user->getPriorityLabel());
    }

    public function test_user_getPriorityEnum_returns_grupo_enum()
    {
        $grupo = Grupo::create([
            'nombre' => 'Test',
            'nivel_prioridad' => 'critica',
            'orden' => 1,
            'activo' => true,
        ]);

        $user = User::create([
            'name' => 'Test',
            'email' => 'test' . uniqid() . '@example.com',
            'password' => 'password',
            'grupo_id' => $grupo->id,
        ]);

        // Reload the user with the relationship loaded
        $user = User::with('grupo')->find($user->id);
        $this->assertEquals(NivelPrioridadEnum::CRITICA, $user->getPriorityEnum());
    }

    // ----- TEST SOLICITUD PRIORIDAD SNAPSHOT -----

    public function test_solicitud_combustible_captura_prioridad_snapshot()
    {
        $grupo = Grupo::create([
            'nombre' => 'Test',
            'nivel_prioridad' => 'alta',
            'orden' => 1,
            'activo' => true,
        ]);

        $unidad = \App\Models\UnidadSolicitante::create(['nombre' => 'Test Unit ' . uniqid(), 'siglas' => 'TU']);

        $user = User::create([
            'name' => 'Test User ',
            'email' => 'test' . uniqid() . '@example.com',
            'password' => 'password',
            'grupo_id' => $grupo->id,
            'unidad_id' => $unidad->id,
        ]);

        $solicitud = SolicitudCombustible::create([
            'codigo' => 'SC' . uniqid(),
            'solicitante_id' => $user->id,
            'cantidad_combustible' => 50,
            'valor_total' => 150.00,
            'prioridad_grupo' => $grupo->nivel_prioridad,
            'prioridad_orden' => $grupo->orden,
        ]);

        $this->assertEquals('alta', $solicitud->prioridad_grupo);
        $this->assertEquals(1, $solicitud->prioridad_orden);
    }

    public function test_solicitud_transporte_captura_prioridad_snapshot()
    {
        $grupo = Grupo::create([
            'nombre' => 'Test',
            'nivel_prioridad' => 'media',
            'orden' => 2,
            'activo' => true,
        ]);

        $unidad = \App\Models\UnidadSolicitante::create(['nombre' => 'Test Unit ' . uniqid(), 'siglas' => 'TU']);

        $user = User::create([
            'name' => 'Test User ' . uniqid(),
            'email' => 'test' . uniqid() . '@example.com',
            'password' => 'password',
            'grupo_id' => $grupo->id,
            'unidad_id' => $unidad->id,
        ]);

        $solicitud = SolicitudTransporte::create([
            'codigo' => 'ST' . uniqid(),
            'solicitante_id' => $user->id,
            'motivo_actividad' => 'Reunión',
            'origen' => 'San Salvador',
            'destino' => 'Santa Ana',
            'unidad_solicitante_id' => $unidad->id,
            'fecha_salida' => now()->addDays(1),
            'fecha_retorno' => now()->addDays(2),
            'cantidad_personas' => 3,
            'prioridad_grupo' => $grupo->nivel_prioridad,
            'prioridad_orden' => $grupo->orden,
        ]);

        $this->assertEquals('media', $solicitud->prioridad_grupo);
        $this->assertEquals(2, $solicitud->prioridad_orden);
    }

    // ----- TEST PRIORITY ENUM -----

    public function test_nivel_prioridad_enum_order_method()
    {
        $this->assertEquals(1, NivelPrioridadEnum::CRITICA->order());
        $this->assertEquals(2, NivelPrioridadEnum::ALTA->order());
        $this->assertEquals(3, NivelPrioridadEnum::MEDIA->order());
        $this->assertEquals(4, NivelPrioridadEnum::BAJA->order());
    }

    public function test_nivel_prioridad_enum_label_method()
    {
        $this->assertEquals('Crítica', NivelPrioridadEnum::CRITICA->label());
        $this->assertEquals('Alta', NivelPrioridadEnum::ALTA->label());
        $this->assertEquals('Media', NivelPrioridadEnum::MEDIA->label());
        $this->assertEquals('Baja', NivelPrioridadEnum::BAJA->label());
    }

    public function test_nivel_prioridad_enum_color_method()
    {
        $this->assertEquals('danger', NivelPrioridadEnum::CRITICA->color());
        $this->assertEquals('warning', NivelPrioridadEnum::ALTA->color());
        $this->assertEquals('info', NivelPrioridadEnum::MEDIA->color());
        $this->assertEquals('gray', NivelPrioridadEnum::BAJA->color());
    }
}
