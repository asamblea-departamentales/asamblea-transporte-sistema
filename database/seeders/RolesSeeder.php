<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesSeeder extends Seeder
{
    public function run(): void
    {
        // ── 1. Crear roles ──
        $superAdmin = Role::firstOrCreate(['name' => 'super_admin', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'solicitante', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'jefe', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'ti', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'operativo', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'liquidador', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'motorista', 'guard_name' => 'web']);

        // ── 2. Asegurar permisos generados por Shield ──
        try {
            Artisan::call('shield:generate', ['--all' => true, '--ignore-config' => true]);
        } catch (\Exception $e) {
            Log::warning('shield:generate falló, creando permisos manualmente: '.$e->getMessage());
            $this->ensureEssentialPermissions();
        }

        // ── 3. Asignar permisos por rol ──
        // super_admin: todos
        $superAdmin->syncPermissions(Permission::all());

        // solicitante (19 permisos de creación/consulta)
        $solicitantePermisos = [
            'create_solicitud::combustible',
            'create_solicitud::mantenimiento',
            'create_solicitud::transporte',
            'update_solicitud::combustible',
            'update_solicitud::mantenimiento',
            'update_solicitud::transporte',
            'view_any_tipo::vehiculo',
            'view_any_vehiculo',
            'view_departamental',
            'view_departamento',
            'view_historial::estado',
            'view_solicitud::combustible',
            'view_solicitud::mantenimiento',
            'view_solicitud::transporte',
            'view_tipo::licencia',
            'view_tipo::vehiculo',
            'view_veh::color',
            'view_veh::marca',
            'view_veh::modelo',
            'view_vehiculo',
        ];
        $role = Role::findByName('solicitante');
        $role->syncPermissions(Permission::whereIn('name', $solicitantePermisos)->get());

        // Permisos completos para jefe, operativo, liquidador, ti
        $fullPermisos = [
            // Creates
            'create_bitacora::evento',
            'create_departamental',
            'create_departamento',
            'create_historial::estado',
            'create_incidencia',
            'create_liquidacion::combustible',
            'create_solicitud::combustible',
            'create_solicitud::mantenimiento',
            'create_solicitud::transporte',
            // Pages
            'page_AprobacionesSolicitudes',
            'page_BandejaOperativa',
            'page_CalendarioFlota',
            'page_GestionOperativaSolicitudes',
            'page_PanelLiquidaciones',
            'page_ReporteControlMensualCombustible',
            'page_ReporteDistribucionCargasCombustible',
            'page_ReporteFlotaVehicular',
            'page_ReporteGeneralServicios',
            'page_ReporteMisionOficial',
            'page_ReporteOrdenTrabajo',
            'page_ReportePlanDiario',
            'page_ReporteRegistroVehiculos',
            'page_ReporteSolicitudesCombustible',
            'page_ReporteSolicitudesMantenimiento',
            'page_ReporteSolicitudesTransporte',
            'page_RevisionOperativa',
            'page_VehiculosCatalogos',
            // Views
            'view_any_asignacion::combustible::lote',
            'view_any_asignacion::vehiculo::motorista',
            'view_any_bitacora::evento',
            'view_any_contrato::combustible',
            'view_any_liquidacion::combustible',
            'view_any_recepcion::entrega::vehiculo',
            'view_any_solicitud::combustible',
            'view_any_solicitud::mantenimiento',
            'view_any_solicitud::transporte',
            'view_asignacion::combustible::lote',
            'view_asignacion::vehiculo::motorista',
            'view_contrato::combustible',
            'view_historial::estado',
            'view_incidencia',
            'view_liquidacion::combustible',
            'view_motorista',
            'view_recepcion::entrega::vehiculo',
            'view_solicitud::combustible',
            'view_solicitud::mantenimiento',
            'view_solicitud::transporte',
            'view_vehiculo',
            // Widgets
            'widget_DashboardActividad',
            'widget_DashboardAlertas',
            'widget_DashboardFinanzas',
            'widget_DashboardStats',
            'widget_RecentSolicitudes',
            'widget_SolicitudesPorPrioridadStats',
            'widget_StatsOverview',
        ];
        $fullPermissionModels = Permission::whereIn('name', $fullPermisos)->get();
        foreach (['jefe', 'operativo', 'liquidador', 'ti'] as $roleName) {
            $role = Role::findByName($roleName);
            $role->syncPermissions($fullPermissionModels);
        }

        // motorista: sin permisos (solo API auth por middleware)
    }

    private function ensureEssentialPermissions(): void
    {
        $essentials = [
            'create_solicitud::combustible',
            'create_solicitud::mantenimiento',
            'create_solicitud::transporte',
            'update_solicitud::combustible',
            'update_solicitud::mantenimiento',
            'update_solicitud::transporte',
            'view_any_tipo::vehiculo',
            'view_any_vehiculo',
            'view_departamental',
            'view_departamento',
            'view_historial::estado',
            'view_solicitud::combustible',
            'view_solicitud::mantenimiento',
            'view_solicitud::transporte',
            'view_tipo::licencia',
            'view_tipo::vehiculo',
            'view_veh::color',
            'view_veh::marca',
            'view_veh::modelo',
            'view_vehiculo',
            'create_bitacora::evento',
            'create_departamental',
            'create_departamento',
            'create_historial::estado',
            'create_incidencia',
            'create_liquidacion::combustible',
            'page_AprobacionesSolicitudes',
            'page_BandejaOperativa',
            'page_CalendarioFlota',
            'page_GestionOperativaSolicitudes',
            'page_PanelLiquidaciones',
            'page_ReporteControlMensualCombustible',
            'page_ReporteDistribucionCargasCombustible',
            'page_ReporteFlotaVehicular',
            'page_ReporteGeneralServicios',
            'page_ReporteMisionOficial',
            'page_ReporteOrdenTrabajo',
            'page_ReportePlanDiario',
            'page_ReporteRegistroVehiculos',
            'page_ReporteSolicitudesCombustible',
            'page_ReporteSolicitudesMantenimiento',
            'page_ReporteSolicitudesTransporte',
            'page_RevisionOperativa',
            'page_VehiculosCatalogos',
            'view_any_asignacion::combustible::lote',
            'view_any_asignacion::vehiculo::motorista',
            'view_any_bitacora::evento',
            'view_any_contrato::combustible',
            'view_any_liquidacion::combustible',
            'view_any_recepcion::entrega::vehiculo',
            'view_any_solicitud::combustible',
            'view_any_solicitud::mantenimiento',
            'view_any_solicitud::transporte',
            'view_asignacion::combustible::lote',
            'view_asignacion::vehiculo::motorista',
            'view_contrato::combustible',
            'view_incidencia',
            'view_liquidacion::combustible',
            'view_motorista',
            'view_recepcion::entrega::vehiculo',
            'widget_DashboardActividad',
            'widget_DashboardAlertas',
            'widget_DashboardFinanzas',
            'widget_DashboardStats',
            'widget_RecentSolicitudes',
            'widget_SolicitudesPorPrioridadStats',
            'widget_StatsOverview',
        ];
        foreach ($essentials as $perm) {
            Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
        }
    }
}
