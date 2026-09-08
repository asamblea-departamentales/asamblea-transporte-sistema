<?php

namespace Tests\Feature;

use App\Models\SolicitudCombustible;
use App\Models\SolicitudMantenimiento;
use App\Models\SolicitudTransporte;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class DocumentosJefaturaApiTest extends TestCase
{
    use DatabaseTransactions;

    private function setUpRoles(): void
    {
        Role::firstOrCreate(['name' => 'jefe', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'operativo', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'solicitante', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'super_admin', 'guard_name' => 'web']);
    }

    private function assertPdf($response): void
    {
        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/pdf');
        $this->assertStringContainsString('%PDF', $response->baseResponse->getContent());
    }

    public function test_jefe_puede_descargar_documento_oficial_de_transporte(): void
    {
        $this->setUpRoles();

        $jefe = User::factory()->create();
        $jefe->assignRole('jefe');

        $solicitud = SolicitudTransporte::factory()->aprobada()->create();

        Sanctum::actingAs($jefe);

        $this->assertPdf(
            $this->getJson("/api/solicitudes-transporte/{$solicitud->codigo}/documento-oficial")
        );
    }

    public function test_jefe_puede_descargar_mision_oficial_de_transporte(): void
    {
        $this->setUpRoles();

        $jefe = User::factory()->create();
        $jefe->assignRole('jefe');

        $solicitud = SolicitudTransporte::factory()->aprobada()->create([
            'decidido_por' => $jefe->id,
        ]);

        Sanctum::actingAs($jefe);

        $this->assertPdf(
            $this->getJson("/api/solicitudes-transporte/{$solicitud->codigo}/mision-oficial")
        );
    }

    public function test_jefe_puede_descargar_documento_oficial_de_combustible(): void
    {
        $this->setUpRoles();

        $jefe = User::factory()->create();
        $jefe->assignRole('jefe');

        $solicitud = SolicitudCombustible::factory()->aprobada()->create();

        Sanctum::actingAs($jefe);

        $this->assertPdf(
            $this->getJson("/api/solicitudes-combustible/{$solicitud->codigo}/documento-oficial")
        );
    }

    public function test_jefe_puede_descargar_orden_de_trabajo_de_mantenimiento(): void
    {
        $this->setUpRoles();

        $jefe = User::factory()->create();
        $jefe->assignRole('jefe');

        $solicitud = SolicitudMantenimiento::factory()->aprobada()->create();

        Sanctum::actingAs($jefe);

        $this->assertPdf(
            $this->getJson("/api/solicitudes-mantenimiento/{$solicitud->codigo}/orden-trabajo")
        );
    }

    public function test_solicitante_no_puede_descargar_documento_oficial(): void
    {
        $this->setUpRoles();

        $solicitante = User::factory()->create();
        $solicitante->assignRole('solicitante');

        $solicitud = SolicitudTransporte::factory()->aprobada()->create();

        Sanctum::actingAs($solicitante);

        $this->get("/api/solicitudes-transporte/{$solicitud->codigo}/documento-oficial")
            ->assertForbidden();
    }

    public function test_documento_oficial_404_sin_solicitud(): void
    {
        $this->setUpRoles();

        $jefe = User::factory()->create();
        $jefe->assignRole('jefe');

        Sanctum::actingAs($jefe);

        $this->getJson('/api/solicitudes-transporte/SOL-NO-EXISTENTE/documento-oficial')
            ->assertNotFound();
    }
}