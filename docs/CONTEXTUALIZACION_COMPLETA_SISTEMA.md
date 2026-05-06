# CONTEXTUALIZACIÓN COMPLETA DEL SISTEMA - PARA IA

## Sistema Integral de Gestión de Solicitudes de Transporte, Mantenimiento y Combustible
### Asamblea Legislativa de El Salvador

**Versión:** Laravel 12 + Filament 3 + PHP 8.3  
**Fecha de documento:** Abril 2026  
**Propósito:** Documento técnico completo para que una IA entienda el sistema sin leer código

---

## 1. DESCRIPCIÓN GENERAL

### ¿Qué es este sistema?
Es una plataforma web administrativa (Back-office) para gestionar **3 tipos de solicitudes** en la Asamblea Legislativa de El Salvador:

1. **Solicitudes de Transporte** (TR-AAAA-######) - Misiones oficiales con vehículos
2. **Solicitudes de Combustible** (CB-AAAA-######) - Asignación de vales de combustible  
3. **Solicitudes de Mantenimiento** (SM-AAAA-######) - Reparaciones y preventivos de flota

### Arquitectura Técnica
- **Backend:** Laravel 12 (PHP 8.3) - Framework MVC
- **Admin Panel:** Filament 3 (Panel administrativo con Livewire)
- **Autenticación API:** Laravel Sanctum (Bearer Tokens)
- **Base de Datos:** SQLite (desarrollo) / MySQL (producción)
- **ORM:** Eloquent (Mapeo Objeto-Relacional)
- **Frontend:** Tailwind CSS 4, Alpine.js (a través de Filament)
- **PDFs:** DomPDF (Barryvdh\DomPDF\Facade)
- **Mapas:** MapTiler API (geolocalización)
- **Permisos:** Spatie Permission + Filament Shield
- **Excel:** Maatwebsite Excel
- **Imágenes:** Intervention Image

---

## 2. ACTORES DEL SISTEMA (ENTIDADES EXTERNAS)

### 2.1 Usuarios por Rol

| Rol | Nombre | Funciones | Acceso a Panel |
|-----|--------|-----------|---------------|
| **super_admin** | Super Administrador | Acceso total, auditoría | SÍ |
| **admin** | Administrador | Gestión técnica, configuración | SÍ |
| **ti** | Soporte Técnico | Aprobaciones, soporte | SÍ |
| **jefe** | Jefe de Unidad | Aprobar/Rechazar solicitudes | SÍ |
| **operativo** | Personal Operativo | Revisión, asignación, bandeja | SÍ |
| **liquidador** | Liquidador | Revisión de comprobantes, liquidación | SÍ |
| **solicitante** | Usuario Solicitante | Crear y enviar solicitudes | NO (solo API) |
| **motorista** | Motorista | Ejecutar transporte, cargar combustible | SÍ (vista limitada) |

### 2.2 Relaciones de Actores

```
[Solicitante] → Crea solicitudes → [Sistema] → Notifica → [Jefe/Operativo]
[Jefe/Operativo] → Aprueba/Rechaza → [Sistema] → Notifica → [Solicitante]
[Jefe/Operativo] → Asigna recursos → [Sistema] → Notifica → [Motorista]
[Motorista] → Ejecuta/Completa → [Sistema] → Registra → [BD]
[Liquidador] → Revisa/Liquida → [Sistema] → Registra → [BD]
```

---

## 3. FLUJOS PRINCIPALES (PROCESS FLOWS)

### 3.1 Estados Unificados (Enum: EstadoSolicitudEnum)

Todos los tipos de solicitudes usan el **mismo Enum** con 12 estados:

```php
BORRADOR = 'borrador'           // Creada, sin enviar
PENDIENTE = 'pendiente'         // Enviada, esperando revisión
EN_REVISION = 'en_revision'    // Con observaciones
PRE_APROBADA = 'pre_aprobada'  // Aprobación inicial
APROBADA = 'aprobada'         // Aprobada oficialmente
RECHAZADA = 'rechazada'        // Rechazada
PROGRAMADA = 'programada'        // Planificada en fecha (solo Transporte)
ASIGNADA = 'asignada'         // Con recursos asignados
EN_EJECUCION = 'en_ejecucion' // En proceso
COMPLETADA = 'completada'       // Finalizada
CANCELADA = 'cancelada'        // Cancelada
LIQUIDADA = 'liquidada'        // Liquidada (solo Combustible/Mantenimiento)
```

### 3.2 Flujo Transporte (SolicitudTransporte)

```
BORRADOR → PENDIENTE → EN_REVISION → PRE_APROBADA → PROGRAMADA → ASIGNADA → EN_EJECUCION → COMPLETADA
                                                              ↓
                                                         CANCELADA ←←←←←←←←←←←
                                                        RECHAZADA ←←←←←←←←
```

**Transiciones clave:**
- **BORRADOR → PENDIENTE**: Enviar (Solicitante)
- **PENDIENTE/EN_REVISION → PRE_APROBADA**: Pre-aprobar (Jefe/Operativo)
- **PRE_APROBADA → PROGRAMADA**: Aprobar (Jefe/Admin/TI)
- **PROGRAMADA → ASIGNADA**: Asignar vehículo y motorista (Jefe/Operativo)
- **ASIGNADA → EN_EJECUCION**: Iniciar ejecución (Motorista)
- **EN_EJECUCION → COMPLETADA**: Finalizar (Solicitante/Motorista)

### 3.3 Flujo Combustible (SolicitudCombustible)

```
BORRADOR → PENDIENTE → EN_REVISION → PRE_APROBADA → APROBADA → ASIGNADA → COMPLETADA → LIQUIDADA
                                                                                                    ↑
                                                        RECHAZADA ←←←←←←←←←←←←←←←←←←←←
                                                        CANCELADA ←←←←←←←←←←←←←
```

**Transiciones especiales:**
- **APROBADA → ASIGNADA**: Asignar vales (Jefe/Operativo) - Requiere contrato y serie
- **ASIGNADA → COMPLETADA**: Completar con comprobantes (Solicitante/Motorista)
- **COMPLETADA → LIQUIDADA**: Liquidar (Liquidador) - Crea registro en `liquidaciones`

### 3.4 Flujo Mantenimiento (SolicitudMantenimiento)

```
BORRADOR → PENDIENTE → EN_REVISION → PRE_APROBADA → APROBADA → EN_EJECUCION → COMPLETADA
                                                                                           ↓
                                                        RECHAZADA ←←←←←←←←←←←←←←←←←←
                                                        CANCELADA ←←←←←←←←←←←←←
```

**Transiciones especiales:**
- **APROBADA → EN_EJECUCION**: Iniciar (Motorista/Operativo)
- **COMPLETADA → LIQUIDADA**: Liquidar (Liquidador)
- **COMPLETADA → Evaluar**: Evaluación post-servicio (Jefe/Operativo) - NO cambia estado

---

## 4. ENTRADAS, PROCESOS Y SALIDAS POR TIPO

### 4.1 SOLICITUD DE TRANSPORTE

#### ENTRADAS (Inputs)
```
- unidad_solicitante_id (FK → UnidadSolicitante)
- solicitante_id (FK → User, se auto-asigna)
- motivo_actividad (string: propósito del viaje)
- origen (string: dirección de partida)
- destino (string: destino principal)
- destino_adicional (string|null: destinos extra, separados por " - ")
- fecha_salida (datetime: fecha y hora de partida)
- fecha_retorno (datetime|null: fecha y hora de retorno)
- cantidad_personas (integer: número de pasajeros)
- prioridad (enum: 'baja'|'media'|'alta')
- tipo_vehiculo_id (FK → TipoVehiculo)
- tipo_vehiculo_nombre (string: cache del nombre)
- coordenadas: origen_lat, origen_lng, destino_lat, destino_lng, destino_adicional_lat, destino_adicional_lng (numeric|null)
- User ID (del solicitante autenticado)
```

#### PROCESO (Processing)
```
1. Validación de datos (StoreSolicitudTransporteRequest)
   - Campos requeridos: unidad_solicitante_id, motivo_actividad, origen, destino, fecha_salida, cantidad_personas, prioridad, tipo_vehiculo
   - Validación de coordenadas (numeric, opcionales)
   
2. Generación automática de código único:
   - Formato: TR-{año}-{correlativo de 6 dígitos}
   - Ejemplo: TR-2026-000001
   - Lógica: Cuenta solicitudes creadas en el año actual + 1
   
3. Creación de registro en BD:
   - estado = BORRADOR (enum EstadoSolicitudEnum)
   - solicitante_id = Auth::id()
   - Los demás campos según validación
   
4. Cambio de estado (opcional desde API):
   - BORRADOR → PENDIENTE (SolicitudTransporteService::enviarSolicitud)
   - Registra en HistorialEstado (entidad_tipo: 'solicitud_transporte')
   - Registra en BitacoraEvento (accion: 'enviar')
   
5. Flujo de aprobación (desde Filament o API):
   a) Observar (PENDIENTE/EN_REVISION → EN_REVISION):
      - Guarda comentario_jefe o observaciones
      - Si estado era PENDIENTE → cambia a EN_REVISION
      - Registra en HistorialEstado y BitacoraEvento (accion: 'observar')
   
   b) Pre-aprobar (PENDIENTE/EN_REVISION → PRE_APROBADA):
      - Solo Jefe/Admin/TI
      - Registra en HistorialEstado y BitacoraEvento (accion: 'pre_aprobar')
   
   c) Aprobar (PRE_APROBADA → PROGRAMADA):
      - Guarda: decidido_por, decidido_en, observaciones
      - Genera firma_aprobador (si viene, base64)
      - Registra en HistorialEstado y BitacoraEvento (accion: 'aprobar')
      - ENVÍA EMAIL al solicitante (NotificacionEventMail):
        Asunto: "✅ Solicitud de Transporte APROBADA"
        Payload: código, estado, origen, destino, solicitante
   
   d) Rechazar (PENDIENTE/EN_REVISION/PRE_APROBADA → RECHAZADA):
      - Guarda: motivo_rechazo, decidido_por, decidido_en
      - Registra en HistorialEstado y BitacoraEvento (accion: 'rechazar')
      - ENVÍA EMAIL de rechazo al solicitante
   
   e) Cancelar (BORRADOR/PENDIENTE → CANCELADA):
      - Solo el solicitante (owner)
      - Registra en HistorialEstado y BitacoraEvento (accion: 'cancelar')
   
6. Asignación de recursos (desde Filament):
   - PROGRAMADA → ASIGNADA
   - Asigna: vehiculo_id, motorista_id
   - Validación: vehículo y motorista disponibles para las fechas
   - Crea registro en asignaciones_vehiculo_motorista (AsignacionVehiculoMotoristaService):
     * Cierra asignaciones vigentes previas (vehiculo y motorista)
     * Crea nueva asignación (vigente = true, desde = now())
   - Registra en HistorialEstado y BitacoraEvento (accion: 'asignar')
   
7. Finalización (desde API/Frontend):
   - ASIGNADA → COMPLETADA
   - Actualiza: fecha_salida_real, fecha_retorno_real, confirmado_por, confirmado_en
   - Registra en HistorialEstado y BitacoraEvento (accion: 'completar')
   - Posible generación de PDF Misión Oficial (opcional)
```

#### SALIDAS (Outputs)
```
1. JSON Responses (API):
   - Crear: {message: "Solicitud creada", data: solicitud + relaciones}
   - Enviar: {message: "Solicitud enviada", data: solicitud}
   - Aprobar: {message: "Solicitud aprobada", data: solicitud}
   - Rechazar: {message: "Solicitud rechazada", data: solicitud}
   - Finalizar: {message: "Viaje finalizado", data: solicitud + confirmador}
   
2. Cambios en Base de Datos:
   - Tabla solicitud_transportes: actualización de estado y campos
   - Tabla historial_estados: nuevos registros (entidad_tipo: 'solicitud_transporte')
   - Tabla bitacora_eventos: nuevos registros (entidad_tipo: 'solicitud_transporte')
   - Tabla asignaciones_vehiculo_motorista: nuevas asignaciones (vigentes)
   
3. Emails (NotificacionEventMail):
   - Aprobación: "✅ Solicitud de Transporte APROBADA"
     * Payload: tipo, evento, mensaje, solicitud (id, código, estado, origen, destino), solicitante (name, email), timestamp
   - Rechazo: "❌ Solicitud de Transporte RECHAZADA"
     * Payload: tipo, evento, mensaje, solicitud (id, código, estado, motivo_rechazo, origen, destino), solicitante
   
4. PDFs (opcional):
   - Misión Oficial (reporte_mision_oficial_pdf.blade.php)
   - Generado con DomPDF: Barryvdh\DomPDF\Facade\Pdf
   - Carga: solicitud + solicitante, autorizador, motorista, vehículo (marca, modelo, color, clasificacion)
```

---

### 4.2 SOLICITUD DE COMBUSTIBLE

#### ENTRADAS (Inputs)
```
- vehiculo_id (FK → Vehiculo, requerido)
- motorista_id (FK → Motorista, se auto-asigna si hay asignación vigente)
- solicitud_transporte_id (FK → SolicitudTransporte|null, opcional)
- destino_actividad (string: actividad/misión)
- cantidad_combustible (decimal: litros/galones solicitados)
- valor_unitario (decimal: precio por unidad, default 0)
- valor_total (decimal: cantidad × unitario, calculado)
- forma_pago (string: 'efectivo'|'tarjeta'|'vale'|'ticket'|'otro')
- numero_vale_ticket (string|null: número de comprobante)
- comprobantes (JSON array|null: rutas de archivos subidos)
- User ID (solicitante_id)
- Al asignar vales:
  - contrato_id (FK → ContratoCombustible)
  - serie_vale_id (FK → SerieVale)
  - cantidad_vales (integer: cantidad de vales a asignar)
```

#### PROCESO (Processing)
```
1. Creación (SolicitudCombustibleService::crear):
   - Auto-asigna motorista si vehículo tiene asignación vigente:
     * Busca en asignaciones_vehiculo_motorista where('vigente', true)
     * Si no encuentra → excepción: "No se puede crear: vehículo sin motorista"
   - Genera código: CB-{año}-{correlativo}
   - estado = BORRADOR
   - Registra en HistorialEstado y BitacoraEvento (accion: 'crear')
   
2. Enviar (BORRADOR → PENDIENTE):
   - Registra en HistorialEstado (BORRADOR → PENDIENTE)
   - Registra en BitacoraEvento (accion: 'enviar')
   - Notificación a operativo (Bandeja)
   
3. Observar/Pre-aprobar/Aprobar/Rechazar/Cancelar:
   - Mismo flujo que Transporte (secciones 4.1 Proceso pasos 5a-5e)
   - Aprobación → estado = APROBADA (no PROGRAMADA)
   - Email de notificación al aprobar/rechazar
   - Al aprobar: genera firma_aprobador (si viene)
   
4. Asignar Vales (Aprobar → ASIGNADA) - CRÍTICO:
   - Validaciones:
     * Contrato activo = true
     * Serie activa = true
     * Serie pertenece al contrato (serie.contrato_id = contrato.id)
     * Hay vales suficientes: fin <= serie.correlativo_fin
     * Contrato tiene saldo: monto_disponible >= montoAsignado
   
   - Cálculos:
     * inicio = serie.correlativo_actual (o correlativo_inicio si null)
     * fin = inicio + cantidad_vales - 1
     * valorUnitario = serie.valor
     * montoAsignado = cantidad_vales × valorUnitario
   
   - Actualiza solicitud:
     * contrato_id, serie_vale_id, correlativo_inicio, correlativo_fin
     * cantidad_vales, valor_unitario_vale, monto_asignado
     * fecha_asignacion = now(), asignado_por = userId
     * estado = ASIGNADA
   
   - Avanza serie: serie.correlativo_actual = fin + 1
   - Descuenta contrato: contrato.monto_disponible -= montoAsignado
   - Registra en HistorialEstado y BitacoraEvento (accion: 'asignar')
   
5. Completar (ASIGNADA → COMPLETADA):
   - Validación: comprobantes NO vacíos (tieneComprobantes())
   - Actualiza: comprobantes (merge existentes + nuevos), forma_pago, numero_vale_ticket
   - Actualiza: valor_unitario, valor_total (si vienen en request)
   - Estado = COMPLETADA
   - Registra en HistorialEstado y BitacoraEvento (accion: 'completar')
   
6. Enviar a Liquidador (ASIGNADA/COMPLETADA → sin cambio estado):
   - Solo movimiento administrativo
   - Validación: comprobantes NO vacíos
   - Registra en HistorialEstado (estado se mantiene) y BitacoraEvento (accion: 'enviar_liquidador')
   
7. Liquidar (COMPLETADA → LIQUIDADA):
   - Validación: comprobantes NO vacíos
   - Crea registro en tabla liquidaciones:
     * user_id, monto_solicitado (= valor_total), monto_validado, resultado, observaciones
     * fecha_liquidacion = now()
   - Estado = LIQUIDADA
   - Registra en HistorialEstado y BitacoraEvento (accion: 'liquidar')
```

#### SALIDAS (Outputs)
```
1. JSON Responses (API):
   - Crear: {data: solicitud}
   - Aprobar/Rechazar: {message, data}
   - Asignar Vales: {message: "Vales asignados", data}
   - Completar: {message: "Completada", data}
   - Liquidar: (no response directo, actualiza BD)
   
2. Cambios en Base de Datos:
   - solicitudes_combustible: actualizaciones (estado, comprobantes, vales, montos)
   - contratos_combustibles: monto_disponible reducido
   - series_vales: correlativo_actual avanzado
   - liquidaciones: nuevo registro (relación polimórfica con solicitud)
   - historial_estados: nuevos registros
   - bitacora_eventos: nuevos registros
   
3. Emails:
   - Aprobación: "✅ Solicitud de Combustible APROBADA"
   - Rechazo: "❌ Solicitud de Combustible RECHAZADA"
   - Payloads similares a Transporte, con vehículo y cantidad_combustible
   
4. Archivos:
   - Comprobantes almacenados (rutas en JSON: comprobantes)
   - Accesibles via storage/app/public/...
```

---

### 4.3 SOLICITUD DE MANTENIMIENTO

#### ENTRADAS (Inputs)
```
- vehiculo_id (FK → Vehiculo, requerido)
- veh_tipo_mantenimiento_id (FK → VehTipoMantenimiento, requerido)
- tipo_solicitud (string: 'taller'|'llantas')
- detalle (text: descripción del problema)
- fecha_sugerida (date: fecha sugerida para mantenimiento)
- costo_estimado (decimal|null: presupuesto estimado)
- prioridad (enum: 'baja'|'media'|'alta')
- adjuntos (JSON array|null: archivos subidos)
- User ID (solicitante_id)
- Al completar:
  - costo_real (decimal: gasto real)
  - fecha_realizada (date: fecha de ejecución)
- Al evaluar (post-completar):
  - evaluacion_estado (string: 'conforme'|'observaciones'|'no_conforme')
  - evaluacion_comentario (string|null)
```

#### PROCESO (Processing)
```
1. Creación (SolicitudMantenimientoService::crear):
   - Genera código: SM-{año}-{correlativo}
   - estado = BORRADOR
   - Registra en HistorialEstado y BitacoraEvento (accion: 'crear')
   
2. Enviar (BORRADOR → PENDIENTE):
   - Mismo flujo que Transporte
   
3. Observar/Pre-aprobar/Aprobar/Rechazar/Cancelar:
   - Mismo flujo que Transporte (secciones 4.1 Proceso pasos 5a-5e)
   - Aprobación → estado = APROBADA (no PROGRAMADA)
   
4. Completar (APROBADA/EN_EJECUCION → COMPLETADA):
   - Validación: adjuntos NO vacíos
   - Actualiza: adjuntos (merge), costo_real, fecha_realizada
   - Guarda: finalizado_por = userId, fecha_finalizacion = now()
   - Estado = COMPLETADA
   - Registra en HistorialEstado y BitacoraEvento (accion: 'completar')
   
5. Evaluar (COMPLETADA → sin cambio estado):
   - Solo registra evaluación, NO cambia estado (se mantiene COMPLETADA)
   - Actualiza: evaluacion_estado, evaluacion_comentario, evaluado_por, fecha_evaluacion
   - Registra en BitacoraEvento (accion: 'evaluar')
   - NO registra en HistorialEstado (porque NO hay cambio de estado)
   
6. Liquidar (COMPLETADA → LIQUIDADA):
   - Validación: adjuntos NO vacíos
   - Crea registro en liquidaciones:
     * monto_solicitado (= costo_real o costo_estimado)
     * monto_validado, resultado, observaciones
   - Estado = LIQUIDADA
   - Registra en HistorialEstado y BitacoraEvento (accion: 'liquidar')
```

#### SALIDAS (Outputs)
```
1. JSON Responses (API):
   - Crear/Completar/Liquidar: similar a los otros tipos
   
2. Cambios en Base de Datos:
   - solicitudes_mantenimiento: actualizaciones (estado, adjuntos, costos, evaluación)
   - liquidaciones: nuevo registro (relación polimórfica)
   - mantenimiento_evaluaciones: (opcional, si hay tabla separada)
   - historial_estados: nuevos registros
   - bitacora_eventos: nuevos registros
   
3. Emails:
   - Aprobación: "✅ Solicitud de Mantenimiento APROBADA"
   - Rechazo: "❌ Solicitud de Mantenimiento RECHAZADA"
   - Payloads incluyen: vehículo (placa), tipo_mantenimiento, detalle
   
4. Archivos:
   - Adjuntos almacenados (rutas en JSON: adjuntos)
```

---

## 5. SERVICIOS DE DOMINIO (Domain Services)

### 5.1 Ubicación
Todos en `app/Domain/Solicitudes/Services/`

### 5.2 Lista de Servicios

| Servicio | Métodos Clave | Propósito |
|----------|----------------|----------|
| **SolicitudTransporteService** | enviarSolicitud, observar, aprobar, rechazar, finalizar | Gestión de transporte |
| **SolicitudCombustibleService** | crear, enviarSolicitud, observar, preAprobar, aprobar, rechazar, cancelar, asignarVales, completar, enviarALiquidador, liquidar | Gestión de combustible |
| **SolicitudMantenimientoService** | enviarSolicitud, observar, preAprobar, aprobar, rechazar, cancelar, completar, evaluar, liquidar | Gestión de mantenimiento |
| **AsignacionVehiculoMotoristaService** | asignar, desasignar | Asignación vehículo-motorista |
| **AprobacionesService** | obtenerSolicitudes, getKpis, aprobar, rechazar, condicionar, reabrir, enviarCorreoAprobacion, enviarCorreoRechazo | Aprobaciones unificadas (3 tipos) |
| **BandejaOperativaService** | obtenerSolicitudes, getKpis, tomarParaRevision, actualizarPrioridad, mapTransporte, mapCombustible, mapMantenimiento | Bandeja operativa unificada |
| **DashboardService** | getKpis, getFinanzas, getAlertas, getActividad | KPIs y widgets del dashboard |
| **LiquidacionUnifiedService** | getAll, mapCombustible, mapMantenimiento | Liquidaciones unificadas |
| **MapImageService** | (métodos de geolocalización) | Integración MapTiler API |
| **MotoristaService** | (gestión de motoristas) | Operaciones de motoristas |
| **IncidenciaService** | (gestión de incidencias) | Reporte de problemas |

---

## 6. REPORTES Y PDFs

### 6.1 Services de Reporte (Domain/Solicitudes/Services/Reportes/)

| Service | Propósito | PDF Vista |
|---------|----------|----------|
| **ReporteMisionOficialService** | Misión oficial individual/masivo | `reports/reporte_mision_oficial_pdf.blade.php` |
| **ReporteFlotaVehicularService** | Flota vehicular | `reports/flota-vehicular_pdf.blade.php` |
| **ReporteControlMensualCombustibleService** | Control mensual combustible | `reports/control-mensual-combustible_pdf.blade.php` |
| **ReporteDistribucionValesCombustibleService** | Distribución vales | `reports/reporte_distribucion_vales_pdf.blade.php` |
| **ReporteGeneralServiciosService** | General de servicios | `reports/reporte_general_servicios_pdf.blade.php` |
| **ReporteOrdenTrabajoService** | Orden de trabajo | `reports/reporte_orden_trabajo_pdf.blade.php` |

### 6.2 Controladores de Reporte (Http/Controllers/Reportes/)

| Controller | Métodos | Vista Filament |
|------------|---------|----------------|
| **ReporteMisionOficialController** | index, pdf | `filament/pages/reporte-mision-oficial.blade.php` |
| **ReporteFlotaVehicularController** | index, pdf | `filament/pages/reporte-flota-vehicular.blade.php` |
| **ReporteControlMensualCombustibleController** | index, pdf | `filament/pages/reporte-control-mensual-combustible.blade.php` |
| **ReporteDistribucionValesCombustibleController** | index, pdf | `filament/pages/reporte-distribucion-vales.blade.php` |
| **ReporteGeneralServiciosController** | index, pdf | `filament/pages/reporte-general-servicios.blade.php` |
| **ReporteOrdenTrabajoController** | index, pdf | `filament/pages/reporte-orden-trabajo.blade.php` |
| **ReporteRecepcionEntregaVehiculoController** | index, pdf | `filament/pages/reporte-recepcion-entrega-vehiculo.blade.php` |

### 6.3 Generación de PDFs

**Proceso:**
1. Controller recibe filtros (date_from, date_to, vehiculo_id, motorista_id, etc.)
2. Service construye query con relaciones:
   - Solicitud + solicitante, autorizador, motorista, vehículo (marca, modelo, color, clasificacion)
3. Service calcula KPIs específicos del reporte
4. Carga vista Blade con datos: `view('reports/...', compact('rows', 'filters', 'kpis'))`
5. Genera PDF: `Pdf::loadView(...)->setPaper('a4', 'portrait')->stream('archivo.pdf')`

---

## 7. CATÁLOGOS (18 CONFIRMADOS)

Son tablas de referencia (lookup tables) con estructura común:
- `id` (primary key)
- `nombre` (string, requerido)
- `activo` (boolean, default true)

### 7.1 Catálogos Geográficos

| Código | Modelo | Tabla | Campos Adicionales | FK Usado por |
|---------|--------|-------|--------------------|-------------|
| CAT-01 | Pais | `paises` | nacionalidad | Departamentos (pais_id) |
| CAT-02 | Departamento | `departamentos` | pais_id | Municipios (departamento_id), Unidades (departamento_id) |
| CAT-03 | Municipio | `municipios` | departamento_id | Proveedores (municipio_id) |

### 7.2 Catálogos Vehiculares

| Código | Modelo | Tabla | Campos Adicionales | FK Usado por |
|---------|--------|-------|--------------------|-------------|
| CAT-04 | TipoVehiculo | `tipo_vehiculos` | - | SolicitudTransporte, Vehiculos |
| CAT-05 | VehMarca | `veh_marcas` | - | VehModelo (veh_marca_id), Vehiculos |
| CAT-06 | VehModelo | `veh_modelos` | veh_marca_id | Vehiculos |
| CAT-07 | VehColor | `veh_colores` | - | Vehiculos |
| CAT-08 | VehTipoMotor | `veh_tipos_motor` | - | Vehiculos |
| CAT-09 | VehTransmision | `veh_transmisiones` | - | Vehiculos |
| CAT-10 | VehTraccion | `veh_tracciones` | - | Vehiculos |
| CAT-11 | VehTipoLlanta | `veh_tipo_llantas` | - | Vehiculos |
| CAT-12 | VehTipoCombustible | `veh_tipo_combustible` | - | Vehiculos, SolicitudCombustible |
| CAT-13 | VehClasificacion | `veh_clasificaciones` | - | Vehiculos |
| CAT-14 | VehEstadoCatalogo | `veh_estados_catalogo` | - | Vehiculos |

### 7.3 Catálogos de Mantenimiento

| Código | Modelo | Tabla | Campos Adicionales | FK Usado por |
|---------|--------|-------|--------------------|-------------|
| CAT-15 | VehTipoMantenimiento | `veh_tipo_mantenimientos` | descripcion | SolicitudMantenimiento |

### 7.4 Catálogos de Personal

| Código | Modelo | Tabla | Campos Adicionales | FK Usado por |
|---------|--------|-------|--------------------|-------------|
| CAT-16 | TipoLicencia | `tipo_licencias` | - | Motoristas |

### 7.5 Catálogos de Proveedores

| Código | Modelo | Tabla | Campos Adicionales | FK Usado por |
|---------|--------|-------|--------------------|-------------|
| CAT-17 | ActividadEconomica | `actividades_economicas` | - | Proveedores (actividad_economica_id) |
| CAT-18 | TamanoProveedor | `tamanos_proveedor` | - | Proveedores (tamano_proveedor_id) |

---

## 8. ENTIDADES NO-CATÁLOGO (5)

Estas tablas tienen lógica de negocio y campos adicionales:

| Código | Modelo | Tabla | Propósito | Campos Clave |
|---------|--------|-------|----------|-------------|
| ENT-01 | UnidadSolicitante | `unidad_solicitantes` | Unidades que solicitan | codigo, nombre, siglas, puede_solicitar_transporte, puede_solicitar_mantenimiento, puede_solicitar_combustible |
| ENT-02 | Proveedor | `proveedores` | Datos de proveedores | nombre_comercial, dui, nit, nrc, tipo_persona, municipo_id, actividad_economica_id, tamano_proveedor_id |
| ENT-03 | ContratoCombustible | `contratos_combustibles` | Contratos de combustible | numero_contrato, monto_inicial, monto_disponible, fecha_inicio, fecha_fin, proveedor_id, activo |
| ENT-04 | SerieVale | `serie_vales` | Series de vales | nombre, valor, valor_compra, correlativo_inicio, correlativo_fin, correlativo_actual, contrato_id, activo |
| ENT-05 | ParametroSistema | `parametros_sistema` | Configuración del sistema | codigo, nombre, tipo, valor, valor_default, data, es_sistema |

---

## 9. TABLAS DE AUDITORÍA

### 9.1 HistorialEstado (historial_estados)

**Propósito:** Trazabilidad de cambios de estado (linea de tiempo)

**Campos:**
- id, entidad_tipo (string: 'solicitud_transporte'|'solicitud_combustible'|'solicitud_mantenimiento')
- entidad_id (integer: ID de la solicitud)
- estado_anterior (string: valor del enum anterior)
- estado_nuevo (string: valor del enum nuevo)
- user_id (FK → User: quién hizo el cambio)
- comentario (text|null: por qué se cambió)
- timestamps

### 9.2 BitacoraEvento (bitacora_eventos)

**Propósito:** Auditoría de acciones realizadas

**Campos:**
- id, entidad_tipo (string: mismo que HistorialEstado)
- entidad_id (integer: ID de la solicitud)
- accion (string: 'crear'|'enviar'|'observar'|'pre_aprobar'|'aprobar'|'rechazar'|'cancelar'|'completar'|'asignar'|'liquidar'|'evaluar'| etc.)
- user_id (FK → User)
- datos_extras (JSON: información adicional como comentarios, montos, etc.)
- timestamps

---

## 10. CONFIGURACIÓN DEL SISTEMA

### 10.1 Archivos de Configuración (config/)

| Archivo | Propósito |
|---------|----------|
| app.php | Nombre app, url, timezone ('America/El_Salvador') |
| auth.php | Guards, providers (Sanctum) |
| database.php | Conexión SQLite/MySQL |
| mail.php | Driver de email (SMTP, Postmark, etc.) |
| permission.php | Spatie Permission config |
| filament-shield.php | Filament Shield (permisos granulares) |
| filament-pwa.php | PWA (Progressive Web App) configuración |
| dompdf.php | DomPDF configuración |
| sanctum.php | API tokens config |
| services.php | APIs externas: MapTiler, Postmark, etc. |

### 10.2 Variables de Entorno (.env)

```
APP_NAME="Transporte Asamblea"
APP_ENV=local/production
APP_KEY=base64:...
APP_URL=http://...

DB_CONNECTION=sqlite/mysql
DB_HOST=...
DB_DATABASE=...

MAIL_MAILER=smtp/postmark
MAIL_HOST=...
MAIL_PORT=...
MAIL_USERNAME=...
MAIL_PASSWORD=...

MAPTILER_API_KEY=...
```

---

## 11. API ENDPOINTS (routes/api.php)

### 11.1 Autenticación

```
POST /api/login → AuthController::login (Sanctum token)
POST /api/logout → AuthController::logout
GET  /api/user → AuthController::user (usuario autenticado)
```

### 11.2 Solicitudes Transporte

```
GET    /api/solicitudes-transporte (index - listar)
POST   /api/solicitudes-transporte (store - crear)
GET    /api/solicitudes-transporte/{id} (show - ver)
POST   /api/solicitudes-transporte/{id}/enviar (enviar)
POST   /api/solicitudes-transporte/{id}/finalizar (finalizar)
POST   /api/solicitudes-transporte/{id}/observacion (observar)
POST   /api/solicitudes-transporte/{id}/aprobar (aprobar)
POST   /api/solicitudes-transporte/{id}/rechazar (rechazar)
GET    /api/solicitudes-transporte/{id}/pdf (generar PDF Misión Oficial)
```

### 11.3 Solicitudes Combustible

```
GET  /api/solicitudes-combustible (index)
POST /api/solicitudes-combustible (store)
GET  /api/solicitudes-combustible/{id} (show)
POST /api/solicitudes-combustible/{id}/aprobar (aprobar)
POST /api/solicitudes-combustible/{id}/rechazar (rechazar)
// ... más endpoints
```

### 11.4 Solicitudes Mantenimiento

```
GET  /api/solicitudes-mantenimiento (index)
POST /api/solicitudes-mantenimiento (store)
GET  /api/solicitudes-mantenimiento/{id} (show)
POST /api/solicitudes-mantenimiento/{id}/aprobar (aprobar)
POST /api/solicitudes-mantenimiento/{id}/rechazar (rechazar)
// ... más endpoints
```

### 11.5 Motorista Estado

```
POST /api/motorista/{id}/cambiar-estado (MotoristaEstadoController::cambiarEstado)
```

---

## 12. FILAMENT RESOURCES (Panel Admin)

Cada Resource tiene:
- Form Schema (campos en crear/editar)
- Table Columns (listado)
- Filters (filtros)
- Actions (acciones: aprobar, rechazar, observar, etc.)

### 12.1 Resources Principales (Solicitudes)

| Resource | Métodos Destacados | Páginas |
|----------|-------------------|--------|
| **SolicitudTransporteResource** | form(), table(), aprobarAction(), rechazarAction(), finalizarAction() | List, Create, Edit, View |
| **SolicitudCombustibleResource** | form(), table(), asignarValesAction(), completarAction(), liquidarAction() | List, Create, Edit, View |
| **SolicitudMantenimientoResource** | form(), table(), completarAction(), evaluarAction(), liquidarAction() | List, Create, Edit, View |

### 12.2 Resources de Catálogos (18 resources)

Todos siguen patrón similar:
- Form: campos básicos (nombre, activo)
- Table: listado con búsqueda
- Acciones: activar/desactivar

### 12.3 Resources Operativos

| Resource | Propósito |
|----------|----------|
| **BandejaOperativaResource** | Vista unificada de solicitudes PENDIENTE/EN_REVISION |
| **AprobacionesSolicitudesResource** | Vista de solicitudes PRE_APROBADA para aprobar |
| **LiquidacionCombustibleResource** | Vista de liquidaciones |
| **PlanificacionFlotaResource** | Calendario de flota (vehículos asignados) |
| **RecepcionEntregaVehiculoResource** | Recepción y entrega de vehículos |

---

## 13. WIDGETS DE DASHBOARD

### 13.1 Stats Widgets

| Widget | Clase | Propósito |
|--------|-------|----------|
| **DashboardStats** | app/Filament/Widgets/DashboardStats.php | Total solicitudes, en ejecución, completadas |
| **DashboardFinanzas** | DashboardFinanzas.php | Total combustible + mantenimiento |
| **DashboardAlertas** | DashboardAlertas.php | Incidencias abiertas, sin comprobantes |
| **DashboardActividad** | DashboardActividad.php | Últimas 10 solicitudes (3 tipos merge) |
| **RecentSolicitudes** | RecentSolicitudes.php | Solicitudes recientes |
| **StatsOverview** | StatsOverview.php | Resumen general |

---

## 14. CORREOS ELECTRÓNICOS (Notificaciones)

### 14.1 Mailable Class

**Archivo:** `app/Mail/NotificacionEventMail.php`

**Uso:** Enviado desde AprobacionesService::enviarCorreoAprobacion() y enviarCorreoRechazo()

### 14.2 Tipos de Emails

| Tipo | Asunto | Payload | Disparador |
|------|--------|---------|-----------|
| Aprobación Transporte | ✅ Solicitud de Transporte APROBADA | código, origen, destino, solicitante | Aprobar |
| Rechazo Transporte | ❌ Solicitud de Transporte RECHAZADA | código, motivo_rechazo, origen, destino | Rechazar |
| Aprobación Combustible | ✅ Solicitud de Combustible APROBADA | código, vehículo, cantidad | Aprobar |
| Rechazo Combustible | ❌ Solicitud de Combustible RECHAZADA | código, motivo_rechazo | Rechazar |
| Aprobación Mantenimiento | ✅ Solicitud de Mantenimiento APROBADA | código, vehículo, tipo_mantenimiento | Aprobar |
| Rechazo Mantenimiento | ❌ Solicitud de Mantenimiento RECHAZADA | código, motivo_rechazo | Rechazar |

---

## 15. MAPEO DE RELACIONES ELOQUENT

### 15.1 SolicitudTransporte

```
SolicitudTransporte {
    unidad() → belongsTo(UnidadSolicitante::class)
    solicitante() → belongsTo(User::class)
    autorizador() → belongsTo(User::class, 'decidido_por')
    aprobador() → belongsTo(User::class, 'decidido_por') // alias
    vehiculo() → belongsTo(Vehiculo::class)
    motorista() → belongsTo(Motorista::class)
    tipoVehiculo() → belongsTo(TipoVehiculo::class)
    confirmador() → belongsTo(User::class, 'confirmado_por')
    despachador() → belongsTo(User::class, 'despachado_por')
    historiales() → hasMany(HistorialEstado::class)
    incidencias() → morphMany(Incidencia::class)
    liquidacion() → morphOne(Liquidacion::class) // opcional
}
```

### 15.2 SolicitudCombustible

```
SolicitudCombustible {
    vehiculo() → belongsTo(Vehiculo::class)
    motorista() → belongsTo(Motorista::class)
    solicitudTransporte() → belongsTo(SolicitudTransporte::class, 'solicitud_transporte_id')
    solicitante() → belongsTo(User::class)
    aprobador() → belongsTo(User::class, 'aprobador_id')
    contrato() → belongsTo(ContratoCombustible::class)
    serieVale() → belongsTo(SerieVale::class, 'serie_vale_id')
    asignador() → belongsTo(User::class, 'asignado_por')
    historiales() → hasMany(HistorialEstado::class)
    liquidacion() → morphOne(Liquidacion::class)
}
```

### 15.3 SolicitudMantenimiento

```
SolicitudMantenimiento {
    vehiculo() → belongsTo(Vehiculo::class)
    tipoMantenimiento() → belongsTo(VehTipoMantenimiento::class, 'veh_tipo_mantenimiento_id')
    solicitante() → belongsTo(User::class)
    aprobador() → belongsTo(User::class, 'aprobador_id')
    finalizador() → belongsTo(User::class, 'finalizado_por')
    evaluador() → belongsTo(User::class, 'evaluado_por')
    historiales() → hasMany(HistorialEstado::class)
    liquidacion() → morphOne(Liquidacion::class)
}
```

---

## 16. ESTRUCTURA DE BASE DE DATOS (Migraciones)

### 16.1 Tablas Principales (3 tipos de solicitudes)

- `solicitud_transportes` (29 campos fillable)
- `solicitudes_combustible` (29 campos fillable)
- `solicitudes_mantenimiento` (22 campos fillable)

### 16.2 Tablas de Catálogos (18 tablas)

Listadas en sección 7.1 a 7.5

### 16.3 Tablas de Auditoría

- `historial_estados` (entidad_tipo, entidad_id, estados, user_id, comentario)
- `bitacora_eventos` (entidad_tipo, entidad_id, accion, user_id, datos_extras)

### 16.4 Tablas de Relaciones

- `asignaciones_vehiculo_motorista` (vehiculo_id, motorista_id, desde, hasta, vigente)
- `liquidaciones` (morphToMany: liquidable_type, liquidable_id, user_id, montos, resultado)

### 16.5 Tablas de Usuarios y Permisos (Spatie)

- `users` (id, name, email, password, unidad_solicitante_id, departamental_id, activo)
- `roles` (id, name, guard_name)
- `permissions` (id, name, guard_name)
- `model_has_roles` (model_id, model_type, role_id)
- `model_has_permissions` (model_id, model_type, permission_id)
- `role_has_permissions` (permission_id, role_id)

---

## 17. FLUJO DE DATOS (DATA FLOW)

### 17.1 Creación de Solicitud (Caja Negra)

```
[Usuario: Solicitante] 
   ↓ (envía formulario + coordenadas)
[Controller: valida, extrae datos]
   ↓ (crea con Service)
[Service: genera código, crea en BD, registra historial/bitácora]
   ↓ (cambia estado a PENDIENTE)
[BD: nueva solicitud + historial + bitácora]
   ↓ (notifica a operativo)
[Bandeja Operativa: lista para revisión]
```

### 17.2 Aprobación (Caja Negra)

```
[Jefe/Operativo: decide aprobar]
   ↓ (envía acción aprobar + comentarios + firma)
[Service: valida estado, cambia a APROBADA/PROGRAMADA]
   ↓ (guarda decidido_por, fecha, observaciones, firma)
[BD: actualiza solicitud + historial + bitácora]
   ↓ (envía email)
[Email: NotificacionEventMail al solicitante]
   ↓ (si Transporte, espera asignación)
[BD: solicitud APROBADA/PROGRAMADA]
```

### 17.3 Asignación de Vales (Caja Negra - Combustible)

```
[Jefe/Operativo: asigna vales]
   ↓ (envía contrato_id, serie_vale_id, cantidad_vales)
[Service: valida contrato, serie, saldo, vales disponibles]
   ↓ (cálcula montos, avanza correlativos)
[BD: actualiza solicitud + contrato + serie + historial + bitácora]
   ↓ (solicitud ASIGNADA)
[Usuario: puede completar con comprobantes]
```

---

## 18. CONSIDERACIONES PARA IA

### 18.1 Variables Críticas para Decisión de Aprobación

#### Transporte:
- `unidad_solicitante_id` → historial de aprobación de la unidad
- `prioridad` → 'alta'|'media'|'baja'
- `cantidad_personas` → afecta tipo de vehículo necesario
- `fecha_salida` / `fecha_retorno` → disponibilidad de recursos
- `origen` / `destino` / coordenadas → análisis de ruta
- `tipo_vehiculo_id` → disponibilidad de flota
- **Calculadas:** disponibilidad_flota, disponibilidad_motoristas, distancia_estimada

#### Combustible:
- `vehiculo_id` → consumo histórico del vehículo
- `cantidad_combustible` → anomalías (muy alta/baja)
- `valor_unitario` / `valor_total` → validar contra mercado
- `contrato_id` → vigencia y saldo
- `solicitud_transporte_id` → si está vinculada a transporte aprobado
- **Calculadas:** consumo_promedio_vehiculo, cantidad_vs_consumo_historico, contrato_vigente

#### Mantenimiento:
- `vehiculo_id` → estado del vehículo, km, mantenimientos previos
- `veh_tipo_mantenimiento_id` → tipo de servicio
- `costo_estimado` → vs promedio histórico
- `tipo_solicitud` → 'taller'|'llantas'
- `detalle` → análisis NLP (naturaleza del problema)
- **Calculadas:** vehiculo_estado_catalogo, dias_desde_ultimo_mantenimiento, costo_promedio_tipo

### 18.2 Reglas Sugeridas para IA

Ver documento: `docs/ANALISIS_VARIABLES_IA.md`

### 18.3 KPIs para Monitoreo

Ver documento: `docs/FLUJOGRAMA_COMPLETO.md` (sección Dashboard)

---

## 19. GLOSARIO DE TÉRMINOS

| Término | Definición |
|----------|-------------|
| **BORRADOR** | Estado inicial, solicitud creada pero no enviada |
| **PENDIENTE** | Solicitud enviada, esperando revisión |
| **EN_REVISION** | Con observaciones del jefe/operativo |
| **PRE_APROBADA** | Aprobación inicial, esperando confirmación final |
| **APROBADA** | Aprobada oficialmente, puede asignarse |
| **PROGRAMADA** | (Solo Transporte) Aprobada y planificada |
| **ASIGNADA** | Con recursos asignados (vehículo/motorista/vales) |
| **EN_EJECUCION** | En proceso de ejecución |
| **COMPLETADA** | Finalizada por el solicitante/motorista |
| **RECHAZADA** | Rechazada con motivo |
| **CANCELADA** | Cancelada por el solicitante |
| **LIQUIDADA** | Liquidada por el liquidador (con comprobantes validados) |
| **firma_aprobador** | Firma digital del jefe (imagen base64) |
| **comprobantes** | Archivos subidos (JSON array de rutas) |
| **adjuntos** | Archivos subidos en mantenimiento (JSON array) |
| **vales** | Vales de combustible asignados (correlativos) |
| **vigente** | Asignación activa (un solo vehículo/motorista a la vez) |

---

## 20. REFERENCIAS A OTROS DOCUMENTOS

| Documento | Propósito | Ubicación |
|-----------|----------|-----------|
| **ANALISIS_VARIABLES_IA.md** | Variables para módulo de aprobaciones con IA | `docs/` |
| **FLUJOGRAMA_COMPLETO.md** | Diagramas de flujo (Kendall & Kendal) | `docs/` |
| **DIAGRAMAS_MERMAID.md** | Diagramas en formato Mermaid | `docs/` |
| **README.md** | Documentación general del proyecto | Raíz del proyecto |

---

**FIN DEL DOCUMENTO DE CONTEXTUALIZACIÓN COMPLETA**

**Para que otra IA entienda el sistema:**
1. Lea este documento completo
2. Revise `docs/ANALISIS_VARIABLES_IA.md` para variables de aprobación
3. Revise `docs/FLUJOGRAMA_COMPLETO.md` para diagramas de flujo
4. Revise `docs/DIAGRAMAS_MERMAID.md` para visualización de diagramas
5. Puede leer cualquier archivo `.php` específico si necesita detalles de implementación

**Este documento cubre:** Actores, Roles, Flujos, Estados, Entradas, Procesos, Salidas, Servicios, Reportes, Catálogos, Auditoría, Configuración, API, Filament, Widgets, Emails, Relaciones, BD, Consideraciones para IA, Glosario.
