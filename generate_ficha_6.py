import datetime

start_date = datetime.date(2026, 1, 27)
end_date = datetime.date(2026, 7, 21)

holy_week_start = datetime.date(2026, 3, 30)
holy_week_end = datetime.date(2026, 4, 3)

holidays = [
    datetime.date(2026, 5, 1),
    datetime.date(2026, 6, 17)
]

# 80 TAREAS ÚNICAS, ORDENADAS CRONOLÓGICAMENTE. SIN REPETICIÓN.
# Cada entrada es una tupla: (Fase, Actividad_A, Actividad_B, Equipo)
unique_tasks = [
    # FASE 1: Análisis y Planificación (Días 1-8)
    ("Fase 1: Análisis y Planificación", "Levantamiento de requerimientos funcionales del sistema de transporte.", "Definición del stack tecnológico: React, TypeScript, Tailwind CSS.", "Laptop, Libreta, Teams"),
    ("Fase 1: Análisis y Planificación", "Análisis de viabilidad técnica para los 3 módulos web.", "Diseño arquitectónico bajo patrón MVC adaptado al cliente.", "Laptop, Libreta, Teams"),
    ("Fase 1: Análisis y Planificación", "Elaboración de historias de usuario para Jefatura y Motoristas.", "Creación de diagramas de flujo de procesos de negocio.", "Laptop, Lucidchart"),
    ("Fase 1: Análisis y Planificación", "Diseño de wireframes de baja fidelidad para el panel administrativo.", "Validación de esquemas de datos con el equipo de backend.", "Laptop, Figma, Teams"),
    ("Fase 1: Análisis y Planificación", "Modelado de interfaces de usuario (UI) para la aplicación móvil.", "Definición de paleta de colores corporativa y tipografía.", "Laptop, Figma"),
    ("Fase 1: Análisis y Planificación", "Elaboración de prototipos interactivos para la aprobación de viajes.", "Revisión de usabilidad y accesibilidad (UX).", "Laptop, Figma"),
    ("Fase 1: Análisis y Planificación", "Definición de estándares de codificación y linteo en TypeScript.", "Estructuración de convenciones para repositorios Git.", "Laptop, VS Code"),
    ("Fase 1: Análisis y Planificación", "Planificación de sprints de desarrollo frontend.", "Asignación de recursos y tiempos estimados por módulo.", "Laptop, Trello/Jira"),

    # FASE 2: Setup e Inicialización (Días 9-15)
    ("Fase 2: Estructuración e Inicialización", "Instalación de Node.js y gestores de paquetes (NPM).", "Inicialización del proyecto 'frontend-transporte' con Vite.", "Laptop, Terminal Bash"),
    ("Fase 2: Estructuración e Inicialización", "Inicialización de los proyectos de Aprobación y Motorista.", "Instalación de dependencias base de React y React Router.", "Laptop, Terminal Bash, NPM"),
    ("Fase 2: Estructuración e Inicialización", "Configuración de Tailwind CSS en los tres repositorios.", "Ajustes de archivos postcss.config.js y tailwind.config.js.", "Laptop, VS Code"),
    ("Fase 2: Estructuración e Inicialización", "Configuración estricta de tsconfig.json para validación de tipos.", "Implementación de aliases de rutas en Vite para imports limpios.", "Laptop, VS Code"),
    ("Fase 2: Estructuración e Inicialización", "Estructuración jerárquica de directorios: components, hooks, pages.", "Creación de archivos index.ts para exportaciones de barril.", "Laptop, VS Code"),
    ("Fase 2: Estructuración e Inicialización", "Configuración de variables de entorno locales (.env.local).", "Pruebas de compilación inicial de los tres repositorios en local.", "Laptop, Terminal Bash"),
    ("Fase 2: Estructuración e Inicialización", "Inicialización de repositorios Git locales.", "Primeros commits estructurales y enlace a remotos en GitHub.", "Laptop, Git, GitHub"),

    # FASE 3: Desarrollo Admin Transporte (Días 16-30)
    ("Fase 3: Desarrollo 'frontend-transporte'", "Implementación del enrutador principal con React Router DOM.", "Configuración de rutas públicas y privadas del administrador.", "Laptop, VS Code"),
    ("Fase 3: Desarrollo 'frontend-transporte'", "Maquetado del Layout principal: Sidebar lateral y Navbar superior.", "Aplicación de estilos responsivos con clases utilitarias de Tailwind.", "Laptop, VS Code, Chrome"),
    ("Fase 3: Desarrollo 'frontend-transporte'", "Desarrollo de componentes UI base: Botones genéricos tipados en TS.", "Desarrollo de componentes Input de texto con manejo de estados.", "Laptop, VS Code"),
    ("Fase 3: Desarrollo 'frontend-transporte'", "Creación de tablas dinámicas de datos para mostrar vehículos.", "Implementación de paginación simulada en el frontend.", "Laptop, VS Code, React DevTools"),
    ("Fase 3: Desarrollo 'frontend-transporte'", "Construcción de modales interactivos para creación de registros.", "Manejo de eventos de teclado (Escape) y clics externos (Backdrop).", "Laptop, VS Code"),
    ("Fase 3: Desarrollo 'frontend-transporte'", "Creación de instancia global de Axios (api.ts) con interceptores.", "Inyección automática de tokens de sesión en cabeceras HTTP.", "Laptop, VS Code"),
    ("Fase 3: Desarrollo 'frontend-transporte'", "Consumo de API RESTful para obtener el catálogo de motoristas.", "Renderizado de listas iterativas usando la función map().", "Laptop, VS Code, Postman"),
    ("Fase 3: Desarrollo 'frontend-transporte'", "Desarrollo del formulario de creación de viajes e itinerarios.", "Validación de campos obligatorios (fechas de salida y retorno).", "Laptop, VS Code"),
    ("Fase 3: Desarrollo 'frontend-transporte'", "Manejo de estados complejos con el hook useReducer.", "Gestión de carga (loading spinners) durante las peticiones HTTP.", "Laptop, VS Code"),
    ("Fase 3: Desarrollo 'frontend-transporte'", "Implementación de notificaciones flotantes (Toast) para éxito/error.", "Integración de librerías de alertas amigables.", "Laptop, VS Code, Navegador"),
    ("Fase 3: Desarrollo 'frontend-transporte'", "Consumo de endpoints de actualización (PUT/PATCH) de rutas.", "Manejo de errores de validación HTTP 422 desde Laravel.", "Laptop, VS Code, Network Tab"),
    ("Fase 3: Desarrollo 'frontend-transporte'", "Desarrollo de vista de detalle de solicitud con histórico de estados.", "Maquetado de línea de tiempo vertical (Timeline) con Tailwind CSS.", "Laptop, VS Code, Chrome"),
    ("Fase 3: Desarrollo 'frontend-transporte'", "Depuración de fugas de memoria en efectos secundarios (useEffect).", "Limpieza de suscripciones al desmontar componentes.", "Laptop, React DevTools"),
    ("Fase 3: Desarrollo 'frontend-transporte'", "Pruebas de integración del flujo administrativo completo.", "Corrección de desbordamientos de CSS en resoluciones pequeñas.", "Laptop, Navegador, VS Code"),
    ("Fase 3: Desarrollo 'frontend-transporte'", "Refactorización de código repetitivo en hooks personalizados (Custom Hooks).", "Optimización de re-renderizados innecesarios (React.memo).", "Laptop, VS Code"),

    # FASE 4: Desarrollo Maprobacion (Días 31-45)
    ("Fase 4: Desarrollo 'Maprobacion-asamblea'", "Implementación del módulo de autenticación de jefaturas.", "Integración con Laravel Sanctum y almacenamiento en sessionStorage.", "Laptop, VS Code, Chrome"),
    ("Fase 4: Desarrollo 'Maprobacion-asamblea'", "Protección de rutas mediante componentes de orden superior (HOC).", "Redirección a pantalla de login si el token expira o es nulo.", "Laptop, VS Code"),
    ("Fase 4: Desarrollo 'Maprobacion-asamblea'", "Desarrollo del Dashboard de aprobaciones pendientes.", "Uso de CSS Grid para tarjetas de resumen estadístico.", "Laptop, VS Code, Tailwind"),
    ("Fase 4: Desarrollo 'Maprobacion-asamblea'", "Construcción de listas dinámicas de solicitudes por evaluar.", "Filtros de búsqueda en tiempo real sobre el estado local de React.", "Laptop, VS Code"),
    ("Fase 4: Desarrollo 'Maprobacion-asamblea'", "Maquetado de pantalla de revisión de detalles de transporte.", "Visualización de justificaciones y presupuesto asignado.", "Laptop, VS Code"),
    ("Fase 4: Desarrollo 'Maprobacion-asamblea'", "Desarrollo de la lógica para el botón 'Aprobar Solicitud'.", "Envío de carga útil (Payload) JSON a la API y manejo de respuesta.", "Laptop, VS Code, Postman"),
    ("Fase 4: Desarrollo 'Maprobacion-asamblea'", "Desarrollo de la lógica para el botón 'Rechazar Solicitud'.", "Implementación de modal obligatorio para capturar el motivo de rechazo.", "Laptop, VS Code"),
    ("Fase 4: Desarrollo 'Maprobacion-asamblea'", "Aplicación de renderizado condicional basado en permisos del usuario.", "Ocultar o mostrar acciones si la solicitud ya fue procesada.", "Laptop, VS Code"),
    ("Fase 4: Desarrollo 'Maprobacion-asamblea'", "Estandarización de interfaces TypeScript para los modelos de datos de Jefatura.", "Mapeo seguro de respuestas de red a tipos estrictos.", "Laptop, VS Code, TypeScript"),
    ("Fase 4: Desarrollo 'Maprobacion-asamblea'", "Optimización de peticiones concurrentes usando Promise.all.", "Carga simultánea de catálogos y datos de perfil.", "Laptop, VS Code"),
    ("Fase 4: Desarrollo 'Maprobacion-asamblea'", "Revisión de accesibilidad web (Focus states, Aria-labels).", "Mejora de la navegación por teclado en los formularios de evaluación.", "Laptop, Chrome DevTools"),
    ("Fase 4: Desarrollo 'Maprobacion-asamblea'", "Configuración de variables de entorno de desarrollo para conectar a IP remota.", "Ajuste de cabeceras CORS en peticiones pre-flight (Options).", "Laptop, Network Tab"),
    ("Fase 4: Desarrollo 'Maprobacion-asamblea'", "Diagnóstico de errores 404 en rutas al recargar la página (SPA fallback).", "Análisis de configuración de servidores locales para Single Page Apps.", "Laptop, VS Code, Navegador"),
    ("Fase 4: Desarrollo 'Maprobacion-asamblea'", "Refactorización visual de componentes para alinear con la imagen institucional.", "Ajuste fino de paletas de color en tailwind.config.ts.", "Laptop, VS Code, Diseño"),
    ("Fase 4: Desarrollo 'Maprobacion-asamblea'", "Ejecución de pruebas funcionales del flujo de aprobación.", "Documentación de endpoints consumidos y respuestas esperadas.", "Laptop, Postman, Markdown"),

    # FASE 5: PWA Motorista (Días 46-60)
    ("Fase 5: Desarrollo PWA 'Motorista'", "Diseño Mobile-First: Creación de layout optimizado para pantallas de 320px.", "Adaptación de menús inferiores (Bottom Navigation Bar).", "Laptop, Emulador Móvil"),
    ("Fase 5: Desarrollo PWA 'Motorista'", "Integración de la aplicación con configuración Progressive Web App.", "Generación e inserción de íconos (512x512) para pantallas de inicio móviles.", "Laptop, VS Code"),
    ("Fase 5: Desarrollo PWA 'Motorista'", "Configuración técnica del archivo manifest.json (Theme Color, Display Standalone).", "Configuración de metaetiquetas viewport restrictivas en index.html.", "Laptop, Chrome DevTools"),
    ("Fase 5: Desarrollo PWA 'Motorista'", "Desarrollo de la vista 'Mi Ruta Activa' para visualizar itinerarios del día.", "Consumo de API de viajes asignados al conductor logueado.", "Laptop, VS Code"),
    ("Fase 5: Desarrollo PWA 'Motorista'", "Programación de botones interactivos de control de viaje: Iniciar, Pausar, Finalizar.", "Cambios de estado local reflejados instantáneamente en la UI.", "Laptop, VS Code, Navegador"),
    ("Fase 5: Desarrollo PWA 'Motorista'", "Desarrollo del submódulo de disponibilidad e incapacidades médicas.", "Diseño de selector de estados (Disponible, Ocupado, No Disponible).", "Laptop, VS Code"),
    ("Fase 5: Desarrollo PWA 'Motorista'", "Lógica condicional de validación: Exigir carga de atestado médico si está incapacitado.", "Control de tipos MIME permitidos en el input file (imágenes y PDFs).", "Laptop, VS Code"),
    ("Fase 5: Desarrollo PWA 'Motorista'", "Modificación de interceptores Axios para soporte binario.", "Inyección de cabecera 'multipart/form-data' en servicio de incapacidades.", "Laptop, VS Code, Postman"),
    ("Fase 5: Desarrollo PWA 'Motorista'", "Captura y envío asíncrono de objetos Blob/File al backend Laravel.", "Verificación de guardado en el servidor e implementación de redirección (useNavigate).", "Laptop, Network Tab"),
    ("Fase 5: Desarrollo PWA 'Motorista'", "Diagnóstico de errores en la carga de archivos grandes.", "Ajustes de promesas asíncronas para evitar bloqueos del hilo principal (Main Thread).", "Laptop, VS Code"),
    ("Fase 5: Desarrollo PWA 'Motorista'", "Integración de componentes visuales para geolocalización o mapas genéricos.", "Uso de contenedores responsivos para iFrames o librerías de mapas de React.", "Laptop, VS Code"),
    ("Fase 5: Desarrollo PWA 'Motorista'", "Pruebas de uso de la aplicación simulando pérdida de conexión a internet.", "Manejo de errores Try/Catch para notificar al usuario sobre red inestable.", "Laptop, Chrome Offline Mode"),
    ("Fase 5: Desarrollo PWA 'Motorista'", "Auditoría de rendimiento web utilizando Google Lighthouse.", "Optimización de imágenes y reducción de peticiones asíncronas bloqueantes.", "Laptop, Lighthouse"),
    ("Fase 5: Desarrollo PWA 'Motorista'", "Corrección de problemas de desbordamiento de teclado virtual en Android.", "Ajustes en altura dinámica (100dvh) mediante clases de Tailwind.", "Laptop, VS Code, Móvil Android"),
    ("Fase 5: Desarrollo PWA 'Motorista'", "Pruebas integrales de subida de atestado y cambio de estado.", "Verificación de actualizaciones en el panel del administrador en tiempo real.", "Laptop, Navegador Web"),

    # FASE 6: Integración y DevOps (Días 61-75)
    ("Fase 6: Integración, Pruebas y DevOps", "Depuración profunda de errores 500 (SQLSTATE 1364).", "Análisis de logs en Laravel y propuestas de cambios en base de datos (Campo DUI Nullable).", "Servidor Ubuntu, VS Code"),
    ("Fase 6: Integración, Pruebas y DevOps", "Ejecución de simulaciones de peticiones concurrentes entre los 3 frontends.", "Detección y resolución de colisiones de variables globales.", "Laptop, Terminal, Navegadores"),
    ("Fase 6: Integración, Pruebas y DevOps", "Resolución de conflictos de dependencias en NPM (ERESOLVE en Vite).", "Ejecución controlada de banderas legacy-peer-deps para asegurar empaquetado.", "Laptop, Terminal Bash"),
    ("Fase 6: Integración, Pruebas y DevOps", "Preparación de la compilación de producción para 'frontend-transporte'.", "Ejecución de comando build y revisión de artefactos en carpeta /dist.", "Laptop, Terminal"),
    ("Fase 6: Integración, Pruebas y DevOps", "Compilación a producción de los módulos 'Maprobacion' y 'Motorista'.", "Minificación de JavaScript y extracción de CSS para rendimiento óptimo.", "Laptop, Terminal"),
    ("Fase 6: Integración, Pruebas y DevOps", "Sincronización de repositorios hacia GitHub.", "Clonado y descarga de últimas versiones en el servidor Linux Ubuntu (Git Pull).", "Laptop, Git, Terminal SSH"),
    ("Fase 6: Integración, Pruebas y DevOps", "Acceso vía SSH al servidor de pruebas local (transporte-server).", "Verificación de rutas absolutas y permisos de carpetas (www-data).", "Servidor Ubuntu, SSH, Terminal"),
    ("Fase 6: Integración, Pruebas y DevOps", "Análisis de configuración actual de Nginx (/etc/nginx/sites-available).", "Creación de bloques lógicos para redirección HTTP a HTTPS.", "Servidor Ubuntu, Nano"),
    ("Fase 6: Integración, Pruebas y DevOps", "Configuración de certificados SSL autofirmados para el entorno local.", "Enlace de llaves públicas y privadas a los puertos correspondientes.", "Servidor Ubuntu, OpenSSL"),
    ("Fase 6: Integración, Pruebas y DevOps", "Implementación de Proxy Inverso en Nginx para 'frontend-transporte' (Puerto 7443).", "Enrutamiento de rutas React (try_files) hacia index.html para evitar error 404.", "Servidor Ubuntu, Nginx"),
    ("Fase 6: Integración, Pruebas y DevOps", "Implementación de Proxy Inverso en Nginx para 'Maprobacion' (Puerto 9443).", "Configuración de paso de cabeceras X-Forwarded-Proto para seguridad de proxy.", "Servidor Ubuntu, Nginx"),
    ("Fase 6: Integración, Pruebas y DevOps", "Implementación de Proxy Inverso en Nginx para PWA Motorista (Puerto 8443).", "Pruebas de verificación de sintaxis de Nginx (nginx -t) y reinicio de servicios.", "Servidor Ubuntu, Nginx, Systemctl"),
    ("Fase 6: Integración, Pruebas y DevOps", "Migración de direcciones IP por cambios de red institucional (192.168.1.70 a 172.19.20.x).", "Reemplazo automatizado de strings en Nginx utilizando el comando 'sed'.", "Servidor Ubuntu, Terminal Bash"),
    ("Fase 6: Integración, Pruebas y DevOps", "Modificación masiva de variables .env.production en los tres frontends.", "Recompilación en el servidor para aplicar las nuevas IPs de consumo de API.", "Servidor Ubuntu, NPM, VS Code"),
    ("Fase 6: Integración, Pruebas y DevOps", "Pruebas finales de acceso HTTPs en red local corporativa.", "Validación de conexión segura y respuesta de las bases de datos de producción.", "Navegador, Dispositivos Locales"),

    # FASE 7: Cierre y Documentación (Días 76-80)
    ("Fase 7: Cierre y Documentación Técnica", "Revisión final de código fuente en los tres repositorios (Code Review).", "Eliminación de variables sin uso, console.logs y comentarios redundantes.", "Laptop, VS Code, ESLint"),
    ("Fase 7: Cierre y Documentación Técnica", "Implementación de técnicas de división de código (Code Splitting) en React.", "Carga diferida (Lazy Loading) de componentes pesados para acelerar el arranque.", "Laptop, VS Code, React.lazy"),
    ("Fase 7: Cierre y Documentación Técnica", "Redacción de la documentación técnica oficial del sistema.", "Detalle de comandos de instalación, dependencias y estructura de Nginx.", "Laptop, Markdown, Git"),
    ("Fase 7: Cierre y Documentación Técnica", "Presentación de resultados y recorrido del software ante el equipo de TI.", "Validación del cumplimiento de los requerimientos iniciales.", "Laptop, Teams/Zoom"),
    ("Fase 7: Cierre y Documentación Técnica", "Entrega final de proyectos estabilizados en servidor.", "Cierre oficial del ciclo de prácticas profesionales y firma de conformidad.", "Laptop, Servidor, Documentos PDF")
]

core_days = []
extra_days_pool = []
current = start_date

while current <= end_date:
    if holy_week_start <= current <= holy_week_end:
        current += datetime.timedelta(days=1)
        continue
    if current in holidays:
        current += datetime.timedelta(days=1)
        continue
    
    if current.weekday() in [1, 2, 3]:
        core_days.append(current)
    elif current.weekday() in [0, 4]:
        extra_days_pool.append(current)
        
    current += datetime.timedelta(days=1)

import random
random.seed(42)
days_needed = 80
missing_days = days_needed - len(core_days)

selected_extras = random.sample(extra_days_pool, missing_days)
final_days = core_days + selected_extras
final_days.sort()

# Generar cronograma
markdown = "# Ficha de Horas Prácticas (640 Horas)\n\n"
markdown += "### Datos Generales\n"
markdown += "- **Estudiante:** [Tu Nombre]\n"
markdown += "- **Período:** 27 de Enero 2026 - 21 de Julio 2026\n"
markdown += "- **Jornada Base:** Martes, Miércoles y Jueves (Con Lunes/Viernes variados para completar horas)\n"
markdown += "- **Horas Diarias:** 8 horas\n"
markdown += "- **Total Horas:** 640\n\n"
markdown += "### Rol Principal: Ingeniero / Analista Frontend (React.js, TypeScript, Tailwind CSS)\n\n"

markdown += "*(Nota: Se excluyeron días de asueto nacional y la semana de asueto gubernamental de Semana Santa).*\n\n"

markdown += "| Fecha | Fase del Desarrollo de Software | Descripción del Trabajo Realizado | No. Horas por Actividad | Total Horas Día | Máquina, Herramienta y Equipo Utilizado |\n"
markdown += "| :--- | :--- | :--- | :---: | :---: | :--- |\n"

for i in range(80):
    day = final_days[i]
    fase, act_a, act_b, equip = unique_tasks[i]
    
    desc = f"• {act_a}<br>• {act_b}"
    hours_col = "4<br><br>4"
    hours_today = 8
    
    date_str = day.strftime("%d/%m/%Y")
    markdown += f"| {date_str} | **{fase}** | {desc} | {hours_col} | {hours_today} | {equip} |\n"

with open('C:\\Users\\tmoyy\\.gemini\\antigravity\\brain\\73da1f11-c75a-437d-9b74-3dc1f200007b\\ficha_horas_640h_unica.md', 'w', encoding='utf-8') as f:
    f.write(markdown)

print("Unique Tasks file generated.")
