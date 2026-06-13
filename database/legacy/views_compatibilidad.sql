-- ============================================================
-- VISTAS DE COMPATIBILIDAD CON ESQUEMA LEGACY
-- Sistema Nuevo (Laravel/Filament) → Nombres Legacy
-- ============================================================
--
-- IMPORTANTE:
-- Estas vistas son únicamente una capa de compatibilidad.
-- No deben usarse para nueva lógica de negocio.
-- Toda nueva funcionalidad debe consumir las tablas reales.
--
-- ============================================================
-- Generado: junio 2026
-- ============================================================


-- ============================================================
-- 1. mot_motorista ← motoristas
-- ============================================================
CREATE OR REPLACE VIEW mot_motorista AS
SELECT
    id                          AS mot_id,
    numero_empleado             AS mot_numero_empleado,
    nombre                      AS mot_nombre,
    dui                         AS mot_dui,
    numero_licencia             AS mot_numero_licencia,
    telefono                    AS mot_telefono,
    correo                      AS mot_correo,
    radio                       AS mot_radio,
    fecha_vencimiento_licencia  AS mot_fecha_vencimiento_licencia,
    tipo_licencia_id            AS mot_tipo_licencia_id,
    user_id                     AS mot_user_id,
    activo                      AS mot_activo,
    created_at                  AS mot_created_at,
    updated_at                  AS mot_updated_at,
    deleted_at                  AS mot_deleted_at
FROM motoristas;


-- ============================================================
-- 2. veh_vehiculo ← vehiculos
-- ============================================================
CREATE OR REPLACE VIEW veh_vehiculo AS
SELECT
    id                  AS veh_id,
    placa               AS veh_placa,
    tipo_vehiculo_id    AS veh_tipo_vehiculo_id,
    marca               AS veh_marca,
    modelo              AS veh_modelo,
    anio                AS veh_anio,
    capacidad_personas  AS veh_capacidad_personas,
    estado              AS veh_estado,
    activo              AS veh_activo,
    created_at          AS veh_created_at,
    updated_at          AS veh_updated_at,
    deleted_at          AS veh_deleted_at
FROM vehiculos;


-- ============================================================
-- 3. sol_solicitud ← solicitud_transportes
-- ============================================================
CREATE OR REPLACE VIEW sol_solicitud AS
SELECT
    id                      AS sol_id,
    codigo                  AS sol_codigo,
    unidad_solicitante_id   AS sol_unidad_solicitante_id,
    solicitante_id          AS sol_solicitante_id,
    motivo_actividad        AS sol_motivo_actividad,
    origen                  AS sol_origen,
    destino                 AS sol_destino,
    destino_adicional       AS sol_destino_adicional,
    fecha_salida            AS sol_fecha_salida,
    fecha_retorno           AS sol_fecha_retorno,
    cantidad_personas       AS sol_cantidad_personas,
    prioridad               AS sol_prioridad,
    estado                  AS sol_estado,
    comentario_jefe         AS sol_comentario_jefe,
    decidido_por            AS sol_decidido_por,
    decidido_en             AS sol_decidido_en,
    vehiculo_id             AS sol_vehiculo_id,
    motorista_id            AS sol_motorista_id,
    tipo_vehiculo_nombre    AS sol_tipo_vehiculo_nombre,
    firma_aprobador         AS sol_firma_aprobador,
    fecha_salida_real       AS sol_fecha_salida_real,
    fecha_retorno_real      AS sol_fecha_retorno_real,
    horas_estimadas         AS sol_horas_estimadas,
    horas_reales            AS sol_horas_reales,
    horas_espera            AS sol_horas_espera,
    fecha_llegada_destino   AS sol_fecha_llegada_destino,
    fecha_inicio_retorno    AS sol_fecha_inicio_retorno,
    decision_final          AS sol_decision_final,
    despachado_por          AS sol_despachado_por,
    confirmado_por          AS sol_confirmado_por,
    confirmado_en           AS sol_confirmado_en,
    origen_lat              AS sol_origen_lat,
    origen_lng              AS sol_origen_lng,
    destino_lat             AS sol_destino_lat,
    destino_lng             AS sol_destino_lng,
    destino_adicional_lat   AS sol_destino_adicional_lat,
    destino_adicional_lng   AS sol_destino_adicional_lng,
    prioridad_grupo         AS sol_prioridad_grupo,
    prioridad_orden         AS sol_prioridad_orden,
    created_at              AS sol_created_at,
    updated_at              AS sol_updated_at,
    deleted_at              AS sol_deleted_at
FROM solicitud_transportes;


-- ============================================================
-- 4. asv_asignacion_vehiculo ← asignaciones_vehiculo_motorista
-- ============================================================
CREATE OR REPLACE VIEW asv_asignacion_vehiculo AS
SELECT
    id              AS asv_id,
    vehiculo_id     AS asv_vehiculo_id,
    motorista_id    AS asv_motorista_id,
    desde           AS asv_desde,
    hasta           AS asv_hasta,
    vigente         AS asv_vigente,
    created_at      AS asv_created_at,
    updated_at      AS asv_updated_at
FROM asignaciones_vehiculo_motorista;


-- ============================================================
-- 5. mnt_mantenimiento ← solicitudes_mantenimiento
-- ============================================================
CREATE OR REPLACE VIEW mnt_mantenimiento AS
SELECT
    id                          AS mnt_id,
    codigo                      AS mnt_codigo,
    vehiculo_id                 AS mnt_vehiculo_id,
    veh_tipo_mantenimiento_id   AS mnt_tipo_mantenimiento_id,
    tipo_solicitud              AS mnt_tipo_solicitud,
    detalle                     AS mnt_detalle,
    fecha_sugerida              AS mnt_fecha_sugerida,
    fecha_realizada             AS mnt_fecha_realizada,
    solicitante_id              AS mnt_solicitante_id,
    prioridad                   AS mnt_prioridad,
    costo_estimado              AS mnt_costo_estimado,
    costo_real                  AS mnt_costo_real,
    estado                      AS mnt_estado,
    aprobador_id                AS mnt_aprobador_id,
    fecha_aprobacion            AS mnt_fecha_aprobacion,
    motivo_rechazo              AS mnt_motivo_rechazo,
    observaciones               AS mnt_observaciones,
    adjuntos                    AS mnt_adjuntos,
    created_at                  AS mnt_created_at,
    updated_at                  AS mnt_updated_at,
    deleted_at                  AS mnt_deleted_at
FROM solicitudes_mantenimiento;


-- ============================================================
-- 6. liq_liquidacion ← liquidaciones
-- ============================================================
CREATE OR REPLACE VIEW liq_liquidacion AS
SELECT
    id                  AS liq_id,
    liquidable_id       AS liq_liquidable_id,
    liquidable_type     AS liq_liquidable_type,
    user_id             AS liq_user_id,
    monto_solicitado    AS liq_monto_solicitado,
    monto_validado      AS liq_monto_validado,
    resultado           AS liq_resultado,
    observaciones       AS liq_observaciones,
    fecha_liquidacion   AS liq_fecha_liquidacion,
    created_at          AS liq_created_at,
    updated_at          AS liq_updated_at
FROM liquidaciones;


-- ============================================================
-- 7. cmb_combustible ← solicitudes_combustible
-- ============================================================
CREATE OR REPLACE VIEW cmb_combustible AS
SELECT
    id                          AS cmb_id,
    codigo                      AS cmb_codigo,
    fecha_solicitud             AS cmb_fecha_solicitud,
    fecha_inicio_periodo        AS cmb_fecha_inicio_periodo,
    fecha_fin_periodo           AS cmb_fecha_fin_periodo,
    vehiculo_id                 AS cmb_vehiculo_id,
    motorista_id                AS cmb_motorista_id,
    solicitud_transporte_id     AS cmb_solicitud_transporte_id,
    destino_actividad           AS cmb_destino_actividad,
    solicitante_id              AS cmb_solicitante_id,
    cantidad_combustible        AS cmb_cantidad_combustible,
    valor_unitario              AS cmb_valor_unitario,
    valor_total                 AS cmb_valor_total,
    forma_pago                  AS cmb_forma_pago,
    numero_vale_ticket          AS cmb_numero_vale_ticket,
    comprobantes                AS cmb_comprobantes,
    estado                      AS cmb_estado,
    prioridad                   AS cmb_prioridad,
    aprobador_id                AS cmb_aprobador_id,
    fecha_aprobacion            AS cmb_fecha_aprobacion,
    motivo_rechazo              AS cmb_motivo_rechazo,
    observaciones               AS cmb_observaciones,
    contrato_id                 AS cmb_contrato_id,
    serie_vale_id               AS cmb_serie_vale_id,
    correlativo_inicio          AS cmb_correlativo_inicio,
    correlativo_fin             AS cmb_correlativo_fin,
    cantidad_vales              AS cmb_cantidad_vales,
    valor_unitario_vale         AS cmb_valor_unitario_vale,
    monto_asignado              AS cmb_monto_asignado,
    fecha_asignacion            AS cmb_fecha_asignacion,
    asignado_por                AS cmb_asignado_por,
    created_at                  AS cmb_created_at,
    updated_at                  AS cmb_updated_at,
    deleted_at                  AS cmb_deleted_at
FROM solicitudes_combustible;


-- ============================================================
-- 8. usr_usuario ← users
-- ============================================================
CREATE OR REPLACE VIEW usr_usuario AS
SELECT
    id                      AS usr_id,
    name                    AS usr_nombre,
    username                AS usr_username,
    email                   AS usr_email,
    email_verified_at       AS usr_email_verificado,
    password                AS usr_password,
    activo                  AS usr_activo,
    unidad_solicitante_id   AS usr_unidad_solicitante_id,
    departamental_id        AS usr_departamental_id,
    grupo_id                AS usr_grupo_id,
    remember_token          AS usr_token,
    created_at              AS usr_created_at,
    updated_at              AS usr_updated_at
FROM users;


-- ============================================================
-- 9. uni_unidad ← unidad_solicitantes
-- ============================================================
CREATE OR REPLACE VIEW uni_unidad AS
SELECT
    id                          AS uni_id,
    nombre                      AS uni_nombre,
    siglas                      AS uni_siglas,
    estado                      AS uni_estado,
    puede_solicitar_transporte  AS uni_puede_solicitar_transporte,
    created_at                  AS uni_created_at,
    updated_at                  AS uni_updated_at,
    deleted_at                  AS uni_deleted_at
FROM unidad_solicitantes;


-- ============================================================
-- 10. tip_tipo_licencia ← tipo_licencias
-- ============================================================
CREATE OR REPLACE VIEW tip_tipo_licencia AS
SELECT
    id          AS tip_id,
    nombre      AS tip_nombre,
    activo      AS tip_activo,
    created_at  AS tip_created_at,
    updated_at  AS tip_updated_at
FROM tipo_licencias;


-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================
