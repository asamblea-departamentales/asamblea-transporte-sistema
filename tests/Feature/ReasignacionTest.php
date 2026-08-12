<?php

namespace Tests\Feature;

use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Models\Motorista;
use App\Models\SolicitudTransporte;
use App\Models\TipoVehiculo;
use App\Models\UnidadSolicitante;
use App\Models\User;
use App\Models\Vehiculo;
use App\Notifications\DestinoAgregado;
use App\Notifications\SolicitudCancelada;
use App\Notifications\SolicitudRechazada;
use App\Notifications\ViajeAsignado;
use App\Notifications\ViajeDesasignado;
use App\Notifications\ViajeObservado;
use App\Notifications\ViajeProgramado;
use App\Notifications\ViajeReasignado;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Laravel\Sanctum\Sanctum;
use NotificationChannels\WebPush\WebPushMessage;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ReasignacionTest extends TestCase
{
    use DatabaseTransactions;

    private function setUpRoles(): void
    {
        Role::firstOrCreate(['name' => 'jefe', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'operativo', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'super_admin', 'guard_name' => 'web']);
    }

    private function createUnidad(): UnidadSolicitante
    {
        return UnidadSolicitante::firstOrCreate(
            ['codigo' => 'DPT-001'],
            [
                'nombre' => 'Dirección General',
                'siglas' => 'DG',
                'estado' => true,
                'puede_solicitar_transporte' => true,
                'puede_solicitar_mantenimiento' => true,
                'puede_solicitar_combustible' => true,
            ]
        );
    }

    private function createSolicitudAprobada(array $overrides = []): SolicitudTransporte
    {
        TipoVehiculo::firstOrCreate(['nombre' => 'Camioneta'], ['activo' => true]);

        return SolicitudTransporte::create(array_merge([
            'unidad_solicitante_id' => $this->createUnidad()->id,
            'solicitante_id' => User::factory()->create()->id,
            'motivo_actividad' => 'Viaje para reasignación',
            'origen' => 'San Salvador',
            'destino' => 'Santa Ana',
            'fecha_salida' => '2026-08-10 08:00:00',
            'fecha_retorno' => '2026-08-12 18:00:00',
            'cantidad_personas' => 2,
            'prioridad' => 'media',
            'prioridad_grupo' => 'media',
            'estado' => EstadoSolicitudEnum::APROBADA,
            'tipo_vehiculo_nombre' => 'Camioneta',
            'encargado' => 'Test User',
            'horas_estimadas' => 58.0,
        ], $overrides));
    }

    private function reasignar(SolicitudTransporte $solicitud, int $vehiculoId, int $motoristaId)
    {
        return $this->putJson("/api/solicitudes-transporte/{$solicitud->codigo}/reasignar", [
            'vehiculo_id' => $vehiculoId,
            'motorista_id' => $motoristaId,
            'motivo_reasignacion' => 'Cambio de recursos por disponibilidad.',
        ]);
    }

    public function test_reasignar_rechaza_motorista_con_viaje_solapado(): void
    {
        $this->setUpRoles();
        $jefe = User::factory()->create();
        $jefe->assignRole('jefe');

        $vehiculoAnterior = Vehiculo::factory()->create();
        $motoristaAnterior = Motorista::factory()->create();
        $vehiculoNuevo = Vehiculo::factory()->create();
        $motoristaNuevo = Motorista::factory()->create();

        $solicitud = $this->createSolicitudAprobada([
            'vehiculo_id' => $vehiculoAnterior->id,
            'motorista_id' => $motoristaAnterior->id,
        ]);

        $this->createSolicitudAprobada([
            'motivo_actividad' => 'Viaje en conflicto',
            'fecha_salida' => '2026-08-11 09:00:00',
            'fecha_retorno' => '2026-08-13 18:00:00',
            'estado' => EstadoSolicitudEnum::PROGRAMADA,
            'motorista_id' => $motoristaNuevo->id,
        ]);

        Sanctum::actingAs($jefe);

        $response = $this->reasignar($solicitud, $vehiculoNuevo->id, $motoristaNuevo->id);

        $response->assertStatus(422);
        $response->assertJson([
            'message' => "El motorista {$motoristaNuevo->nombre} ya tiene un viaje en el rango de fechas solicitado.",
        ]);
    }

    public function test_reasignar_rechaza_motorista_con_licencia_vencida(): void
    {
        $this->setUpRoles();
        $jefe = User::factory()->create();
        $jefe->assignRole('jefe');

        $vehiculoAnterior = Vehiculo::factory()->create();
        $motoristaAnterior = Motorista::factory()->create();
        $vehiculoNuevo = Vehiculo::factory()->create();
        $motoristaNuevo = Motorista::factory()->create([
            'fecha_vencimiento_licencia' => '2026-08-01',
        ]);

        $solicitud = $this->createSolicitudAprobada([
            'vehiculo_id' => $vehiculoAnterior->id,
            'motorista_id' => $motoristaAnterior->id,
        ]);

        Sanctum::actingAs($jefe);

        $response = $this->reasignar($solicitud, $vehiculoNuevo->id, $motoristaNuevo->id);

        $response->assertStatus(422);
        $response->assertJson([
            'message' => "La licencia del motorista {$motoristaNuevo->nombre} vence antes de la fecha de retorno del viaje.",
        ]);
    }

    public function test_reasignar_notifica_al_motorista_anterior_y_al_nuevo(): void
    {
        $this->setUpRoles();
        $jefe = User::factory()->create();
        $jefe->assignRole('jefe');

        $vehiculoAnterior = Vehiculo::factory()->create();
        $motoristaAnterior = Motorista::factory()->create();
        $vehiculoNuevo = Vehiculo::factory()->create();
        $motoristaNuevo = Motorista::factory()->create();

        $solicitud = $this->createSolicitudAprobada([
            'vehiculo_id' => $vehiculoAnterior->id,
            'motorista_id' => $motoristaAnterior->id,
        ]);

        Sanctum::actingAs($jefe);

        $response = $this->reasignar($solicitud, $vehiculoNuevo->id, $motoristaNuevo->id);

        $response->assertStatus(200);

        $this->assertDatabaseHas('notifications', [
            'type' => ViajeReasignado::class,
            'notifiable_type' => Motorista::class,
            'notifiable_id' => $motoristaNuevo->id,
        ]);

        $this->assertDatabaseHas('notifications', [
            'type' => ViajeDesasignado::class,
            'notifiable_type' => Motorista::class,
            'notifiable_id' => $motoristaAnterior->id,
        ]);
    }

    public function test_todas_las_notificaciones_generan_web_push_desde_to_array(): void
    {
        $this->setUpRoles();
        $vehiculo = Vehiculo::factory()->create();
        $motorista = Motorista::factory()->create();
        $solicitud = $this->createSolicitudAprobada([
            'vehiculo_id' => $vehiculo->id,
            'motorista_id' => $motorista->id,
        ]);

        $notificaciones = [
            new ViajeAsignado($solicitud),
            new ViajeReasignado($solicitud),
            new ViajeObservado($solicitud, 'Comentario de prueba'),
            new DestinoAgregado($solicitud, 'Centro Histórico'),
            new SolicitudCancelada($solicitud, 'Cancelada por prueba'),
            new SolicitudRechazada($solicitud, 'Rechazada por prueba'),
            new ViajeDesasignado($solicitud),
            new ViajeProgramado($solicitud),
        ];

        foreach ($notificaciones as $notificacion) {
            $payload = $notificacion->toArray($motorista);
            $message = $notificacion->toWebPush($motorista, $notificacion);

            $this->assertInstanceOf(WebPushMessage::class, $message);
            $this->assertSame($payload['titulo'], $message->toArray()['title']);
            $this->assertSame($payload['mensaje'], $message->toArray()['body']);
        }
    }

    public function test_viaje_programado_payload_incluye_modulo_y_url(): void
    {
        $this->setUpRoles();
        $vehiculo = Vehiculo::factory()->create();
        $motorista = Motorista::factory()->create();
        $solicitud = $this->createSolicitudAprobada([
            'vehiculo_id' => $vehiculo->id,
            'motorista_id' => $motorista->id,
        ]);

        $notificacion = new ViajeProgramado($solicitud);

        $data = $notificacion->toArray($motorista);
        $this->assertSame('viaje_programado', $data['tipo']);
        $this->assertSame('transporte', $data['modulo']);
        $this->assertSame('/viajes', $data['url']);

        $message = $notificacion->toWebPush($motorista, $notificacion);
        $payload = $message->toArray();
        $this->assertSame($data['titulo'], $payload['title']);
        $this->assertSame($data['mensaje'], $payload['body']);
        $this->assertArrayHasKey('url', $payload['data']);
        $this->assertArrayHasKey('modulo', $payload['data']);
    }
}
