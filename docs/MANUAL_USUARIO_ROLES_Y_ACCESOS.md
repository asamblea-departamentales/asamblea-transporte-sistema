# MANUAL DE USUARIO - Sistema de Transporte
## Asamblea Legislativa de El Salvador

---

## ¿QUÉ ES EL SISTEMA?

Es una plataforma web para gestionar todo lo relacionado con la flota vehicular de la Asamblea Legislativa. Dentro del sistema se pueden hacer tres tipos de solicitudes:

| Tipo de solicitud | ¿Para qué sirve? |
|---|---|
| **Transporte** | Pedir un vehículo con motorista para una misión o viaje oficial |
| **Combustible** | Solicitar vales de gasolina para los vehículos |
| **Mantenimiento** | Reportar averías o programar servicios (taller, llantas) |

---

## ¿CÓMO INGRESAR AL SISTEMA?

1. Abra su navegador (Chrome, Edge, Firefox)
2. Vaya a la dirección: **https://transporte.asamblea.gob.sv/admin** (o la que le hayan proporcionado)
3. Ingrese su **usuario y contraseña** (los mismos que usa en su computadora de la Asamblea)
4. Si es la primera vez, el sistema no fuerza el cambio de contraseña automáticamente

---

## LOS ROLES DEL SISTEMA

Cada persona que ingresa al sistema tiene un **rol** (un "sombrero" que le dice qué puede hacer y qué no). Su jefe o el departamento de informática le asigna el rol según su cargo.

---

## 📌 ROL: SOLICITANTE

**¿Quién es?** Cualquier empleado de la Asamblea que necesite pedir un vehículo, gasolina o un mantenimiento.

**¿Cómo ingresa?** No ingresa al panel web. Usa una aplicación aparte o un sistema externo para crear sus solicitudes.

**¿Qué puede hacer?**

| Qué | Explicación |
|---|---|
| **Crear solicitudes** | Puede pedir transporte, combustible o mantenimiento desde una aplicación móvil o página web externa |
| **Enviar solicitudes** | Una vez creada, la envía para que su jefe la revise |
| **Cancelar solicitudes** | Si se arrepiente, puede cancelar la solicitud mientras no haya sido aprobada |
| **Ver sus solicitudes** | Consulta el estado de sus pedidos (si están pendientes, aprobados, rechazados, etc.) |
| **Finalizar viajes** | Cuando un viaje termina, puede confirmar que todo salió bien |
| **Recibir correos** | Le llega un correo cuando su solicitud es aprobada ✅ o rechazada ❌ |

**¿Qué NO puede hacer?**
- ❌ No puede ver solicitudes de otras personas
- ❌ No puede aprobar ni rechazar nada
- ❌ No puede modificar catálogos (vehículos, motoristas, etc.)

---

## 📌 ROL: MOTORISTA

**¿Quién es?** El conductor asignado a un vehículo. Es quien maneja en las misiones oficiales.

**¿Cómo ingresa?** No ingresa al panel administrativo. Usa la aplicación móvil o una interfaz API diseñada para motoristas.

**¿Qué puede hacer?**

| Qué | Explicación |
|---|---|
| **Ver mis viajes** | Consulta los viajes que le asignaron en el mes, con fechas, horarios, origen y destino |
| **Iniciar viaje** | Cuando sale hacia el destino, marca en el sistema que el viaje comenzó (registra la hora de salida) |
| **Registrar llegada** | Cuando llega al destino, marca la hora de llegada |
| **Iniciar retorno** | Cuando emprende el regreso, lo registra |
| **Finalizar viaje** | Cuando regresa a la Asamblea, marca el viaje como completado (el sistema calcula las horas reales) |
| **Cambiar mi estado** | Puede marcarse como "No disponible" si está enfermo, de permiso, etc. Puede adjuntar un comprobante (como una incapacidad). El sistema avisa por correo a los jefes |

**¿Qué NO puede hacer?**
- ❌ No puede crear solicitudes
- ❌ No puede aprobar ni rechazar nada
- ❌ No ve información de otros motoristas
- ❌ No puede modificar catálogos

---

## 📌 ROL: OPERATIVO

**¿Quién es?** El personal de la unidad de transporte que revisa las solicitudes entrantes, las valida técnicamente y prepara todo para que el jefe decida.

**¿Cómo se llama su pantalla principal?** "Bandeja Operativa" y "Revisión Operativa"

**¿Qué puede hacer?**

| Qué | Explicación |
|---|---|
| **Ver todas las solicitudes entrantes** | Ve los pedidos de transporte, combustible y mantenimiento que van llegando |
| **Tomar una solicitud para revisarla** | Se asigna una solicitud a sí mismo para empezar a revisarla |
| **Cambiar la prioridad** | Puede subir o bajar la prioridad de una solicitud (alta, media, baja) según el caso |
| **Poner observaciones** | Si falta información, puede devolver la solicitud con comentarios para que el solicitante la corrija |
| **Derivar a otro compañero** | Pasar la solicitud a otro operativo si él es quien debe revisarla |
| **Validar técnicamente** | Revisa que todo esté correcto (fechas válidas, datos completos, recursos disponibles) y la manda a pre-aprobación |
| **Ver el detalle de solicitudes** | Puede entrar a ver la información completa de cualquier solicitud |
| **Asignar vehículo y motorista** | En las solicitudes de transporte, puede asignar qué vehículo y qué conductor van a realizar el viaje |
| **Asignar vales de combustible** | Puede asignar los vales de gasolina a las solicitudes de combustible aprobadas |
| **Registrar entrega/recepción de vehículos** | Puede registrar cuándo se entrega un vehículo a un motorista y cuándo lo devuelve, con control de kilometraje, combustible y herramientas |
| **Ver el calendario de flota** | Puede consultar un calendario visual con todos los viajes programados |
| **Ver lotes de combustible** | Puede consultar los lotes de asignación de gasolina |
| **Ver el panel de liquidaciones** | Puede consultar las liquidaciones (pero no liquidar) |

**¿Qué NO puede hacer?**
- ❌ No puede dar la aprobación final (eso es del Jefe)
- ❌ No puede crear ni modificar vehículos, motoristas, proveedores, contratos
- ❌ No puede ver la bitácora de auditoría
- ❌ No puede gestionar usuarios ni roles
- ❌ No puede borrar solicitudes

---

## 📌 ROL: JEFE (Jefe de Unidad)

**¿Quién es?** La persona encargada de tomar las decisiones finales: aprobar o rechazar las solicitudes. Normalmente es el jefe de la unidad de transporte o un puesto similar.

**¿Qué puede hacer?**

| Qué | Explicación |
|---|---|
| **✅ Aprobar solicitudes** | Da el visto bueno final a las solicitudes de transporte, combustible y mantenimiento que ya fueron revisadas por el operativo |
| **❌ Rechazar solicitudes** | Cuando una solicitud no procede, la rechaza indicando el motivo (el sistema envía un correo automático al solicitante) |
| **↩️ Condicionar** | Devuelve la solicitud con condiciones específicas que deben cumplirse |
| **🔄 Reabrir** | Vuelve a abrir una solicitud que ya había sido cerrada |
| **Asignar vehículo y motorista** | Al igual que el operativo, puede asignar recursos a los viajes |
| **Asignar vales de combustible** | Puede asignar los vales a solicitudes de combustible aprobadas |
| **Firma digital** | Al aprobar, puede dibujar su firma con el mouse (en una pantalla táctil o con el dedo) y queda guardada en el PDF |
| **Comparar sugerencias** | Ve una comparación entre lo que el sistema sugiere, lo que asignó el operativo, y puede decidir cuál opción es mejor |
| **Gestionar todo el catálogo** | Puede crear, editar y eliminar vehículos, motoristas, proveedores, contratos, marcas, modelos, colores, tipos de vehículo, etc. |
| **Ver y gestionar incidencias** | Puede reportar y dar seguimiento a incidentes (daños, accidentes, fallas mecánicas) |
| **Ver planificación de flota** | Panel visual con tarjetas de cada vehículo, su estado y motorista asignado |
| **Ver el calendario de flota** | Calendario con todos los viajes programados |
| **Ver bitácora de eventos** | Consulta el registro de todas las acciones hechas en el sistema (quién hizo qué y cuándo) |
| **Ver historial de estados** | Consulta el historial de cambios de estado de cada solicitud |
| **Gestionar grupos** | Puede crear y modificar grupos de trabajo |
| **Generar reportes** | Puede descargar reportes en PDF, Excel y CSV de todos los tipos de solicitudes |
| **Generar PDF de misión oficial** | Genera el documento formal de la misión para imprimir o archivar |
| **Ver el panel de liquidaciones** | Consulta las liquidaciones y su estado |

**¿Qué NO puede hacer?**
- ❌ No puede gestionar usuarios (solo TI y Admin)
- ❌ No puede gestionar roles y permisos
- ❌ No puede gestionar departamentales
- ❌ No puede modificar parámetros del sistema (solo puede verlos)

---

## 📌 ROL: TI (Soporte Técnico)

**¿Quién es?** El personal de informática que da soporte técnico al sistema.

**¿Qué puede hacer?** Básicamente lo mismo que el Jefe, con algunos accesos extras:

| Extra que puede hacer el TI |
|---|
| **✅ Gestionar usuarios** - Puede crear, editar, activar/desactivar usuarios |
| **✅ Gestionar departamentales** - Puede administrar las dependencias |
| **✅ Acceso a roles (con permiso)** - Puede asignar roles a los usuarios |
| **✅ Ver todo** - Tiene acceso a todas las pantallas del sistema |

**¿Qué NO puede hacer?**
- ❌ Solo puede eliminar ciertos registros (algunas funciones de borrado están reservadas para Admin y Jefe)

---

## 📌 ROL: ADMIN (Administrador)

**¿Quién es?** El encargado de la configuración técnica del sistema.

**¿Qué puede hacer?**

| Qué | Explicación |
|---|---|
| **Todo lo del Jefe** | Puede hacer todo lo que hace un Jefe |
| **Gestionar usuarios** | Crear, editar y desactivar usuarios del sistema |
| **Gestionar roles** | Asignar roles y permisos a los usuarios |
| **Gestionar parámetros** | Puede modificar parámetros del sistema (configuraciones globales) |
| **Gestionar departamentales** | Administrar las dependencias |
| **Eliminar registros** | Tiene permiso de borrar en todos los catálogos |
| **Crear lotes de combustible** | Puede crear lotes de asignación de gasolina |
| **Ver bitácora e historial** | Acceso completo a registros de auditoría |

---

## 📌 ROL: SUPER ADMIN (Super Administrador)

**¿Quién es?** El dueño del sistema. Tiene acceso a absolutamente todo sin restricciones.

**¿Qué puede hacer?** TODO. No hay ninguna función del sistema a la que no tenga acceso.

**Recomendación:** Este rol solo debe tenerlo 1 o 2 personas de confianza (como el encargado del sistema o el jefe de informática).

---

## 📌 ROL: LIQUIDADOR

**¿Quién es?** La persona encargada de revisar los gastos y comprobantes para hacer la liquidación financiera de las solicitudes de combustible y mantenimiento.

**¿Qué puede hacer?**

| Qué | Explicación |
|---|---|
| **Ver panel de liquidaciones** | Pantalla principal donde ve todas las solicitudes que esperan liquidación |
| **Ver detalle completo** | Puede ver los montos solicitados, comprobantes (fotos de facturas recibos) |
| **Liquidar** | Registrar el monto final validado y si el gasto coincide o tiene diferencias con lo solicitado |
| **Reportar incidencias** | Si encuentra algo irregular, puede reportarlo como incidencia |
| **Generar PDFs** | Descargar PDF de misión oficial, orden de trabajo, liquidación |
| **Ver solicitudes** | Puede consultar las solicitudes de transporte, combustible y mantenimiento (solo lectura) |

**¿Qué NO puede hacer?**
- ❌ No puede crear, editar ni borrar nada en los catálogos
- ❌ No puede aprobar ni rechazar solicitudes
- ❌ No puede ver la planificación de flota
- ❌ No puede gestionar usuarios
- ❌ No puede ver la bitácora de auditoría

---

## MAPA RÁPIDO: ¿QUÉ PUEDE VER Y HACER CADA QUIEN?

| Pantalla / Función | Solicitante | Motorista | Operativo | Jefe | TI | Admin | Super Admin | Liquidador |
|---|---|---|---|---|---|---|---|---|
| **Crear solicitudes (vía externa)** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Ver solicitudes de transporte** | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Ver solicitudes de combustible** | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Ver solicitudes de mantenimiento** | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Aprobar/Rechazar solicitudes** | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Asignar vehículo y motorista** | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Asignar vales de combustible** | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Gestionar vehículos** | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Gestionar motoristas** | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Gestionar proveedores** | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Gestionar contratos** | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Gestionar usuarios** | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ |
| **Gestionar roles** | ❌ | ❌ | ❌ | ❌ | ✅* | ✅ | ✅ | ❌ |
| **Ver calendario de flota** | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Ver planificación de flota** | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Registrar entrega/recepción vehículo** | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Liquidar solicitudes** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Gestionar lotes de combustible** | ❌ | ❌ | ✅ (ver) | ✅ | ❌ | ✅ | ✅ | ❌ |
| **Reportar incidencias** | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Ver bitácora de eventos** | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Generar reportes PDF/Excel/CSV** | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Cambiar mi estado (motorista)** | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Iniciar/Finalizar viaje** | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |

*TI = con permiso especial

---

## PREGUNTAS FRECUENTES

**1. No veo ninguna pantalla al entrar**
Revise con su jefe o con informática qué rol tiene asignado. Si su rol es "Solicitante", usted no ingresa al panel web, sino a una aplicación aparte.

**2. Quiero aprobar una solicitud pero no me aparece el botón**
Revise que su rol sea Jefe, Admin o TI. Si es Operativo, usted solo puede revisar y validar, no aprobar.

**3. Recibí un correo de "solicitud aprobada" pero no sé qué sigue**
- Si es de **transporte**: espere a que le asignen vehículo y motorista. Luego el motorista iniciará el viaje.
- Si es de **combustible**: espere a que le asignen los vales. Luego podrá completar la solicitud subiendo los comprobantes.
- Si es de **mantenimiento**: el taller procederá a hacer el trabajo.

**4. ¿Cómo sé en qué estado está mi solicitud?**
Los estados (en orden) son:
| Estado | Significa |
|---|---|
| **Borrador** | La solicitud fue creada pero no enviada |
| **Pendiente** | Enviada, esperando que alguien la revise |
| **En revisión** | Un operativo la está revisando |
| **Pre-aprobada** | El operativo ya la validó, esperando la decisión del jefe |
| **Aprobada** | El jefe le dio el visto bueno |
| **Programada** (solo transporte) | Ya aprobada, esperando asignación de vehículo |
| **Asignada** | Ya tiene recursos asignados (vehículo, motorista, vales) |
| **En ejecución** | El viaje/mantenimiento está en proceso |
| **Completada** | Finalizada exitosamente |
| **Liquidada** | Ya fue revisada y cerrada financieramente |
| **Rechazada** | No fue aprobada (con motivo) |
| **Cancelada** | El solicitante la canceló |

---

*Documento actualizado a junio de 2026*
