# Reporte de Actividades y Cambios Realizados

---

## 1. Ticket auto-generado — visibilidad en PDFs y Filament

### Problema
Todo esto, basado en las sugerencias y procesos reales que nos comentaron las personas de transporte el dia de la reunión.
 Creacion del campo `ticket` (auto-generado) para las 3 solicitudes (`transporte`, `combustible`, `mantenimiento`) pero no era visible en todos los PDFs de reportes existentes. Y como dijeron que se basan en ese `ticket`, era necesario agregar el campo y que fuera visible en cada uno de los reportes.

### Cambios realizados

| Archivo | Cambio | Propósito |
|---|---|---|
| `SolicitudTransporteResource.php` | `->copyable()` en columna `ticket` | Que el usuario pueda copiar el ticket con 1 clic |
| `SolicitudCombustibleResource.php` | `->copyable()` en columna `ticket` | Igual |
| `SolicitudMantenimientoResource.php` | `->copyable()` en columna `ticket` | Igual |
| `liquidacion_pdf.blade.php` | Ticket # en encabezado | Visible en PDF de liquidación de combustible |
| `liquidacion_mantenimiento_pdf.blade.php` | Ticket # en encabezado | Visible en PDF de liquidación de mantenimiento |
| `reporte_mision_oficial_pdf.blade.php` | Ticket # sobre bloque de texto | Visible en misión oficial |
| `reporte_orden_trabajo_pdf.blade.php` | Ticket # en encabezado | Visible en orden de trabajo |
| `control-mensual-combustible_pdf.blade.php` | Columna Ticket en tabla | Visible en control mensual |
| `solicitudes_combustible_pdf.blade.php` | Columna Ticket en tabla | Visible en reporte de solicitudes combustible |

---

## 2. Filtro por ticket en reportes Filament

### Problema
No se podía buscar/filtrar solicitudes por número de ticket en los reportes.

### Cambios realizados

| Archivo | Cambio | Propósito |
|---|---|---|
| `ReporteSolicitudesTransporte.php` | + columna `ticket` en tabla + filtro `TextInput` + condición en `buildQuery()` | Filtrar y ver tickets en reporte de transporte |
| `ReporteSolicitudesCombustible.php` | + columna `ticket` en tabla + filtro `TextInput` + condición en `buildQuery()` | Filtrar y ver tickets en reporte de combustible |
| `ReporteSolicitudesMantenimiento.php` | + columna `ticket` en tabla + filtro `TextInput` + condición en `buildQuery()` | Filtrar y ver tickets en reporte de mantenimiento |

---

## 3. Auditoría de exportaciones (Fase 1)

### Problema
No se registraba en bitácora quién/cuándo exportaba PDFs, Excel o CSV desde el sistema. Y en la reunion, una de las cosas que mencionaron fue que necesitaban auditoria impresa para los reportes, seria registrar y saber quién imprimió/exportó qué, en el sistema se registraría lo siguiente:
* **Usuario**
* **Fecha**
* **Reporte**
* **Filtros**
* **Cantidad registros**


### Cambios realizados

| Archivo | Cambio | Propósito |
|---|---|---|
| `routes/web.php` | `app(AuditoriaService::class)->registrar(EXPORTAR_PDF)` en 3 rutas PDF masivas | Auditar exportaciones PDF desde reportes |
| `routes/web.php` | `app(AuditoriaService::class)->registrar(...)` en 6 rutas Excel/CSV | Auditar exportaciones Excel/CSV (sesión anterior) |
| `LiquidacionCombustibleController.php` | + imports + `registrar(EXPORTAR_PDF)` | Auditar PDF de liquidación de combustible |
| `LiquidacionMantenimientoController.php` | + imports + `registrar(EXPORTAR_PDF)` | Auditar PDF de liquidación de mantenimiento |
| `ReporteMisionOficialController.php` | + imports + `registrar(EXPORTAR_PDF)` | Auditar PDF de misión oficial |
| `ReporteOrdenTrabajoController.php` | + imports + `registrar(EXPORTAR_PDF)` | Auditar PDF de orden de trabajo |
| `ReporteControlMensualCombustibleController.php` | + imports + `registrar(EXPORTAR_PDF)` | Auditar PDF de control mensual |
| `ReporteSolicitudAutorizacionController.php` | + imports + `registrar(EXPORTAR_PDF)` | Auditar PDF de documento de autorización |
| `ReporteSolicitudesTransporte.php` | + imports `AuditoriaService` + `AccionBitacoraEnum` | Faltaban en archivo modificado en sesión anterior |
| `ReporteSolicitudesMantenimiento.php` | + imports `AuditoriaService` + `AccionBitacoraEnum` | Faltaban en archivo modificado en sesión anterior |

### Patrón utilizado

```php
app(AuditoriaService::class)->registrar(
    AccionBitacoraEnum::EXPORTAR_PDF,
    'entidad_tipo',
    [...datos...]
);
```

Se ejecuta antes del `->stream()` o `->download()`.

---

## 4. Vale gasolinera y cambio en el uso de la palabra `Vale`  (`numero_vale_ticket`) — visible en Filament y PDFs

### Problema
Primero, *Don Guillermo*, nos comentó que ya no se usan Vales o Cupones, si no que se usan **Cargas**, así que se cambió todo lo que incluía la palabra `Vale` o `Cupon` relacionado con las solicitudes de Combustible.

Se agregó el campo `numero_vale_ticket` (vale externo de gasolinera, solo para combustible) en la base de datos y en el export Excel, pero no era visible en Filament ni en PDFs de reportes.

### Cambios realizados

| Archivo | Cambio | Propósito |
|---|---|---|
| `SolicitudCombustibleResource.php` | + `Placeholder` en form + `TextColumn` en tabla | Ver vale gasolinera en detalle y tabla |
| `ReporteSolicitudesCombustible.php` | + columna “Vale gasolinera” en tabla | Ver vale en reporte Filament |
| `liquidacion_pdf.blade.php` | + fila “Vale gasolinera” en tabla de datos | Mostrar en PDF de liquidación |
| `solicitudes_combustible_pdf.blade.php` | + columna “Vale #” en tabla | Mostrar en PDF de solicitudes combustible |
| `control-mensual-combustible_pdf.blade.php` | + columna “Vale #” en tabla | Mostrar en PDF de control mensual |

---


## 5. *Pendiente de que usted nos confirme* — Lote Combustible (diseñado, no implementado)

### Contexto identificado
**Don Guillermo**, nos preguntó cosas relacionadas al sistema nuevo, e identificó lo que puede ser una variación entre el sistema viejo y el nuevo. Primeramente, habiamos entendido que el `Jefe`, además de *Aprobar* o *Rechazar* era el encargado de asignar, ya sea las cargas de combustible o los vehículos para las solicitudes de transporte, pero él nos dijo que en realidad la persona encargada de **Asignar** era la persona con rol *Operativo*, que en el caso de las cargas de combustible, se basa en uno de los nuevos reportes que nos dieron *(que por cierto, ya esta implementado)*, donde esa persona con el rol *Operativo* es la que asigna, no es el jefe.

En esos nuevos reportes que nos dieron a raíz de la reunión, es este:
![Reporte Asignacion de Cargas](C:/Users/steve/Downloads/Reporte2.jpg)


Donde **Don Guillermo** y el día de la reunión, nos dieron a entender que, el mismo sistema debía realizar por completo ese nuevo reporte, porque actualmente *Don Carlos*, lo realiza todo a mano, y él solo entrega esa pagina, y la persona operativa, es la que entra al sistema viejo, y asigna basado en lo asignado por *Don Carlos* en ese reporte.


El flujo actual de **Lote Combustible** requerirá rediseño y confirmación.

### Flujo propuesto

#### Jefe
1. Crea lote
2. Se auto-generan tickets + placas desde solicitudes del día
3. Llena montos manualmente
4. Finaliza lote
5. Imprime PDF

#### Operativo
1. Ve el lote finalizado
2. Puede asignar cargas usando el flujo existente de contratos/series

### Estado actual

- Diseño funcional definido
- Pendiente de implementación

### Impacto estimado

- Aproximadamente 7 archivos a modificar

---

