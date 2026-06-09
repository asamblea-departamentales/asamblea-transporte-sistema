# Manual de Uso — Sistema de Transporte y Flota

Fecha: 2026-06-08

## Resumen ejecutivo

Este documento describe, flujo por flujo, los procesos actuales implementados en el sistema de gestión de transporte y flota. Incluye los actores principales, puntos de entrada (UI/API), pasos operativos, salidas (reportes/exports) y archivos/servicios clave para cada proceso. Está pensado como base para un manual de usuario y referencia técnica.

## Índice
- Solicitud de Transporte
- Solicitud de Mantenimiento
- Solicitud de Combustible y Lotes
- Asignación Vehículo–Motorista / Planificación de Flota
- Liquidaciones (Combustible / Mantenimiento)
- Recepción / Entrega de Vehículo
- Incidencias y Gestión Operativa
- Aprobaciones / Bandeja Operativa / Revisión Operativa
- Reportes y Exportes
- Usuarios, Roles y Permisos
- API móvil para Motoristas
- Auditoría y Bitácora
- Apéndice: Endpoints y archivos clave

---

## Solicitud de Transporte

**Propósito:** Crear y gestionar solicitudes de transporte, asignar vehículo y motorista, ejecutar viaje y cerrar.

**Actores principales:** solicitante (unidad solicitante), gestor/operativo, aprobador/supervisor, planificador/asignador, motorista (app móvil).

**Puntos de entrada:**
- Interfaz administrativa: Filament Resource [SolicitudTransporteResource](app/Filament/Resources/SolicitudTransporteResource.php)
- API móvil / integraciones: [app/Http/Controllers/Api/SolicitudTransporteController.php](app/Http/Controllers/Api/SolicitudTransporteController.php)
- Modelo central: [app/Models/SolicitudTransporte.php](app/Models/SolicitudTransporte.php)

**Pasos (operativo):**
1. El solicitante crea la solicitud con fecha, origen, destino, propósito y datos de la unidad solicitante.
2. La solicitud entra en proceso de validación y aprobación (bandeja operativa).
3. El sistema puede generar sugerencias de asignación (servicio `SugerenciaAsignacionService`).
4. El planificador/o gestor asigna vehículo y motorista mediante [AsignacionVehiculoMotoristaResource](app/Filament/Resources/AsignacionVehiculoMotoristaResource.php) o servicio `AsignacionVehiculoMotoristaService`.
5. El motorista confirma la asignación desde la API móvil; actualiza estado de viaje (`MotoristaViajeController`, `MotoristaEstadoController`).
6. Viaje en ejecución: se registran eventos, consumos y/o incidencias.
7. Recepción/entrega y cierre de la solicitud; se genera registro para liquidaciones si aplica.

**Salidas / reportes:** PDF/Excel de solicitudes y plan diario. Vea endpoints en [routes/web.php](routes/web.php).

**Archivos/servicios clave:**
- [app/Domain/Solicitudes/Services/SolicitudTransporteService.php](app/Domain/Solicitudes/Services/SolicitudTransporteService.php)
- [app/Domain/Solicitudes/Services/SugerenciaAsignacionService.php](app/Domain/Solicitudes/Services/SugerenciaAsignacionService.php)
- [app/Exports/SolicitudesTransporteExport.php](app/Exports/SolicitudesTransporteExport.php)

---

## Solicitud de Mantenimiento

**Propósito:** Reportar trabajos de mantenimiento, generar órdenes, ejecutar reparaciones y liquidar costos.

**Actores:** solicitante, jefe/gestor de mantenimiento, técnico/mecánico, finanzas.

**Puntos de entrada:**
- Filament Resource: [SolicitudMantenimientoResource](app/Filament/Resources/SolicitudMantenimientoResource.php)
- Modelo: [app/Models/SolicitudMantenimiento.php](app/Models/SolicitudMantenimiento.php)
- Servicio: [SolicitudMantenimientoService](app/Domain/Solicitudes/Services/SolicitudMantenimientoService.php)

**Pasos:**
1. Registro de la falla o solicitud con información del vehículo y descripción.
2. Evaluación y priorización por parte del gestor.
3. Aprobación y generación de orden de trabajo.
4. Ejecución del trabajo por técnico; registro de piezas/horas.
5. Evaluación de la reparación y cierre; generar liquidación (si aplica) y reportes.

**Archivos/servicios clave:**
- [app/Domain/Solicitudes/Services/SolicitudMantenimientoService.php](app/Domain/Solicitudes/Services/SolicitudMantenimientoService.php)
- [app/Exports/SolicitudesMantenimientoExport.php](app/Exports/SolicitudesMantenimientoExport.php)

---

## Solicitud de Combustible y Asignación de Lotes

**Propósito:** Solicitar combustible, gestionar lotes y registrar entregas/consumos.

**Actores:** solicitante, operador de combustible/almacén, encargado de lote, motorista/entregador, finanzas.

**Puntos de entrada:**
- Filament Resource: [SolicitudCombustibleResource](app/Filament/Resources/SolicitudCombustibleResource.php)
- Recursos de lotes: [AsignacionCombustibleLoteResource](app/Filament/Resources/AsignacionCombustibleLoteResource.php)
- Servicio: [SolicitudCombustibleService](app/Domain/Solicitudes/Services/SolicitudCombustibleService.php)
- Exports: [AsignacionCombustibleLoteExport.php](app/Exports/AsignacionCombustibleLoteExport.php)

**Pasos:**
1. Crear solicitud indicando litros requeridos, vehículo y fecha.
2. Aprobación por responsable operativo/financiero.
3. Asignación a lote disponible; registrar detalles en [AsignacionCombustibleLoteDetalle].
4. Entrega y registro por motorista/operador; actualización de stock de lote.
5. Consolidación y liquidación para contabilidad; reportes mensuales.

**Widgets / paneles:** Hay widgets en Filament para seguimiento de lotes y últimas asignaciones.

---

## Asignación Vehículo–Motorista / Planificación de Flota

**Propósito:** Planificar turnos y asignaciones diarias de vehículos y motoristas.

**Actores:** planificador, operador, motorista, responsables de flota.

**Puntos de entrada:**
- Filament Resource: [AsignacionVehiculoMotoristaResource](app/Filament/Resources/AsignacionVehiculoMotoristaResource.php)
- Servicio: [AsignacionVehiculoMotoristaService](app/Domain/Solicitudes/Services/AsignacionVehiculoMotoristaService.php)

**Pasos:**
1. Crear plan diario/semanal con vehículos disponibles.
2. Asignar motorista a vehículo y registrar turno.
3. Notificar y confirmar por motorista (API móvil).
4. Ajustes y reasignaciones en caso de cambios operativos.

---

## Liquidaciones (Combustible / Mantenimiento / Generales)

**Propósito:** Consolidar gastos y generar documentos de respaldo.

**Actores:** finanzas, gestor operativo, admin.

**Puntos de entrada:**
- Modelos: [Liquidacion](app/Models/Liquidacion.php), [LiquidacionCombustible](app/Models/LiquidacionCombustible.php)
- Página Filament: [PanelLiquidaciones](app/Filament/Pages/PanelLiquidaciones.php)
- Servicios: [LiquidacionUnifiedService](app/Domain/Solicitudes/Services/Liquidaciones/LiquidacionUnifiedService.php)

**Pasos:**
1. Recolectar registros de consumos y órdenes.
2. Generar liquidación consolidada.
3. Validación y aprobación por finanzas.
4. Exportar/PDF y registro contable.

---

## Recepción / Entrega de Vehículo

**Propósito:** Registrar inspección y estado al recibir/entregar vehículo.

**Actores:** motorista, receptor/inspector, gestor operativo.

**Puntos de entrada:**
- Filament Resource: [RecepcionEntregaVehiculoResource](app/Filament/Resources/RecepcionEntregaVehiculoResource.php)
- Modelo: [app/Models/RecepcionEntregaVehiculo.php](app/Models/RecepcionEntregaVehiculo.php)

**Pasos:**
1. Registrar recepción con kilometraje y observaciones.
2. Inspección y registro de daños/observaciones.
3. Registro de entrega y cierre.

---

## Incidencias y Gestión Operativa

**Propósito:** Reportar y dar seguimiento a incidentes en la flota o durante viajes.

**Actores:** motorista, operador, equipo de soporte operativo, administradores.

**Puntos de entrada:**
- Filament Resource: [IncidenciaResource](app/Filament/Resources/IncidenciaResource.php)
- Modelo: [app/Models/Incidencia.php](app/Models/Incidencia.php)
- Servicio: [IncidenciaService](app/Domain/Solicitudes/Services/IncidenciaService.php)

**Pasos:**
1. Registro de la incidencia con severidad y tipo.
2. Clasificación y asignación a responsable.
3. Acciones correctivas y seguimiento hasta cierre.

---

## Aprobaciones / Bandeja Operativa / Revisión Operativa

**Propósito:** Cola central para revisar y aprobar solicitudes operativas.

**Actores:** aprobadores, gestores operativos, supervisores.

**Puntos de entrada:**
- Filament Pages: [AprobacionesSolicitudes](app/Filament/Pages/AprobacionesSolicitudes.php), [BandejaOperativa](app/Filament/Pages/BandejaOperativa.php), [RevisionOperativa](app/Filament/Pages/RevisionOperativa.php)
- Servicios: [AprobacionesService](app/Domain/Solicitudes/Services/Operativo/AprobacionesService.php)

**Pasos típicos:**
1. Revisión de datos y documentos adjuntos.
2. Aprobar/Rechazar o solicitar correcciones.
3. Notificación al solicitante y flujo consecuente.

---

## Reportes y Exportes

**Propósito:** Generar PDFs y Excel para control, auditoría y finanzas.

**Puntos de entrada:**
- Endpoints web para PDFs: rutas en [routes/web.php](routes/web.php) (ej.: `/reportes/solicitudes-transporte/pdf`, `/reportes/lote-combustible/{lote}/pdf`).
- Controladores de reportes: [app/Http/Controllers/Reportes](app/Http/Controllers/Reportes)
- Exports: [app/Exports](app/Exports)

**Pasos:**
1. Seleccionar filtros y periodo en UI.
2. Ejecutar generación (controlador prepara datos y renderiza PDF/Excel).
3. Descargar o archivar el documento.

---

## Usuarios, Roles y Permisos

**Propósito:** Gestión de accesos usando Spatie Permissions y Filament Resources.

**Puntos de entrada:**
- Filament Resources: [UserResource](app/Filament/Resources/UserResource.php), [RoleResource](app/Filament/Resources/RoleResource.php)
- Configuración: [config/permission.php](config/permission.php)

**Notas:** El sistema usa roles y permisos (tabla `roles`, `permissions`) para controlar accesos en Filament y en las APIs. Revise `RoleResource` para ver permisos definidos en la UI.

---

## API móvil para Motoristas

**Propósito:** Permitir a motoristas autenticarse, ver viajes asignados y reportar estados desde un cliente móvil.

**Puntos de entrada:**
- Autenticación / tokens: [app/Http/Controllers/Api/TokenAuthController.php](app/Http/Controllers/Api/TokenAuthController.php)
- Endpoints de viaje y estado: [MotoristaViajeController](app/Http/Controllers/Api/MotoristaViajeController.php), [MotoristaEstadoController](app/Http/Controllers/Api/MotoristaEstadoController.php)

**Flujo:** login → recibir asignaciones → confirmar inicio de viaje → actualizaciones de estado → cierre.

---

## Auditoría y Bitácora

**Propósito:** Registrar eventos y acciones para trazabilidad.

**Puntos de entrada:**
- Modelo: [BitacoraEvento](app/Models/BitacoraEvento.php)
- Filament Resource: [BitacoraEventoResource](app/Filament/Resources/BitacoraEventoResource.php)
- Servicio: [AuditoriaService](app/Domain/Solicitudes/Services/AuditoriaService.php)

**Uso:** Los eventos se graban automáticamente; los auditores y administradores pueden consultar y exportar registros.

---

## Apéndice: Endpoints y archivos clave (referencia rápida)

- Rutas de reportes (PDF/Excel): [routes/web.php](routes/web.php)
- Controladores API: [app/Http/Controllers/Api](app/Http/Controllers/Api)
- Controladores de reportes: [app/Http/Controllers/Reportes](app/Http/Controllers/Reportes)
- Recursos Filament (panel administrativo): [app/Filament](app/Filament)
- Servicios del dominio: [app/Domain/Solicitudes/Services](app/Domain/Solicitudes/Services)
- Modelos principales: [app/Models](app/Models)

---

## Checklists por actor (rápido)

- Solicitante: Crear solicitud → Adjuntar info → Esperar notificación de aprobación.
- Gestor/Planificador: Revisar bandeja → Aprobar/Asignar → Notificar motorista.
- Motorista: Autenticar → Confirmar asignación → Reportar inicio/fin/incidencias.
- Operador de combustible: Revisar solicitudes → Asignar lote → Registrar entrega.
- Finanzas: Revisar liquidaciones → Aprobar exportes → Archivar documentos.

---

## Próximos pasos sugeridos

1. Añadir capturas de pantalla Filament para cada sección.
2. Generar checklists detallados por rol con ejemplos de campos.
3. Exportar este Markdown a PDF para distribución.

Si quieres, genero ahora el PDF o incluyo capturas de pantalla de las vistas Filament.
