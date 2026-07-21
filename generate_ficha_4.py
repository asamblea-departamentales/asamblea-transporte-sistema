import datetime
import random
import math

start_date = datetime.date(2026, 1, 27)
end_date = datetime.date(2026, 7, 21)

# Semana Santa 2026: Lunes 30 Marzo al Viernes 3 de Abril
holy_week_start = datetime.date(2026, 3, 30)
holy_week_end = datetime.date(2026, 4, 3)

holidays = [
    datetime.date(2026, 5, 1),   # Día del trabajo (Viernes)
    datetime.date(2026, 6, 17)   # Día del padre (Miércoles)
]

# Definimos las fases del proyecto desde cero para las 3 aplicaciones
phases = [
    {
        "name": "Fase 1: Análisis y Planificación",
        "days": 10,
        "tasks": [
            "Reuniones con los interesados para levantamiento de requerimientos del sistema de transporte.",
            "Análisis de viabilidad técnica y definición del stack tecnológico (React, TypeScript, Vite, Tailwind).",
            "Diseño de la arquitectura de software para los tres módulos independientes (Administración, Aprobación, Motorista).",
            "Creación de historias de usuario, diagramas de flujo y wireframes de baja fidelidad.",
            "Diseño de la interfaz de usuario (UI) en herramientas de diseño web. Definición de paleta de colores y tipografía."
        ],
        "equip": "Laptop, Libreta, Teams/Zoom, Herramientas de Diseño UI"
    },
    {
        "name": "Fase 2: Creación e Inicialización de Proyectos",
        "days": 10,
        "tasks": [
            "Inicialización del proyecto 'frontend-transporte' desde cero usando Node.js y Vite.",
            "Inicialización del proyecto 'Maprobacion-asamblea' desde cero usando Node.js y Vite.",
            "Inicialización del proyecto 'asamblea-transporte-motorista' desde cero usando Node.js y Vite.",
            "Instalación y configuración del framework Tailwind CSS en los tres repositorios.",
            "Configuración de repositorios locales en Git y enlace a GitHub para el control de versiones.",
            "Creación de la estructura de carpetas estándar (src/components, src/hooks, src/pages, src/services)."
        ],
        "equip": "Laptop, Terminal Bash, Git, VS Code, Node.js"
    },
    {
        "name": "Fase 3: Desarrollo Core 'frontend-transporte'",
        "days": 15,
        "tasks": [
            "Desarrollo de layouts principales y sistema de navegación dinámica con React Router DOM.",
            "Creación de componentes reutilizables (Botones, Tablas, Modales, Inputs) usando Tailwind CSS.",
            "Integración de peticiones HTTP con Axios para consumir los endpoints del módulo administrativo.",
            "Manejo del estado de la aplicación para el CRUD de vehículos, rutas y gestión de personal.",
            "Validaciones de formularios en el cliente y manejo de errores (Try/Catch) en peticiones."
        ],
        "equip": "Laptop, VS Code, React DevTools, Chrome"
    },
    {
        "name": "Fase 4: Desarrollo Core 'Maprobacion-asamblea'",
        "days": 15,
        "tasks": [
            "Implementación del módulo de autenticación con Laravel Sanctum y manejo de tokens en SessionStorage.",
            "Creación del panel (Dashboard) para que los jefes revisen las solicitudes pendientes de autorización.",
            "Desarrollo de los flujos de 'Aprobar' y 'Rechazar' solicitudes con sus respectivos componentes interactivos.",
            "Aplicación de reglas de negocio para ocultar o mostrar botones de acción según el rol del usuario.",
            "Sincronización de componentes en tiempo real con los estados devueltos por el backend."
        ],
        "equip": "Laptop, VS Code, Postman, Chrome"
    },
    {
        "name": "Fase 5: Desarrollo Core 'asamblea-transporte-motorista' (PWA)",
        "days": 15,
        "tasks": [
            "Diseño de la aplicación bajo el enfoque 'Mobile-First' exclusivo para el uso en el celular de los motoristas.",
            "Configuración de etiquetas meta, manifest.json y service workers para convertir la app en una Progressive Web App (PWA).",
            "Desarrollo de la pantalla principal: Visualización de rutas asignadas y botones de 'Iniciar' / 'Finalizar' viaje.",
            "Desarrollo del submódulo de incapacidades. Configuración de peticiones con 'multipart/form-data' para subida de atestados médicos.",
            "Implementación de mapas de geolocalización o trazado de rutas usando librerías de terceros en React."
        ],
        "equip": "Laptop, Dispositivo Móvil (Android/iOS), VS Code, Lighthouse"
    },
    {
        "name": "Fase 6: DevOps, Nginx y Pruebas Cruzadas",
        "days": 10,
        "tasks": [
            "Ejecución de pruebas cruzadas entre los 3 frontends interactuando simultáneamente con el backend.",
            "Diagnóstico y resolución de bloqueos por políticas CORS en los servidores locales.",
            "Preparación de los proyectos para producción (npm run build) y compilación de assets.",
            "Configuración de Nginx en servidor Linux. Creación de Reverse Proxies para los puertos 7443, 8443 y 9443.",
            "Ajustes de variables de entorno (.env.production) para apuntar a las IPs correctas del servidor."
        ],
        "equip": "Servidor Ubuntu, SSH, Terminal Bash, Nano, VS Code"
    },
    {
        "name": "Fase 7: Cierre y Documentación",
        "days": 5,
        "tasks": [
            "Corrección de los últimos bugs reportados en pruebas de usuario (UAT).",
            "Optimización del rendimiento web (Lazy Loading) y reducción del tamaño del bundle final.",
            "Refactorización final de código para eliminar consola de depuración y comentarios innecesarios.",
            "Documentación técnica de los proyectos, instrucciones de despliegue y manuales de usuario.",
            "Entrega oficial de los repositorios y despliegue final estabilizado."
        ],
        "equip": "Laptop, VS Code, Git, Markdown"
    }
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

days_needed = 80
missing_days = days_needed - len(core_days)

random.seed(123)
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
markdown += "### Rol Principal: Analista y Desarrollador Frontend (Creación desde cero)\n\n"

markdown += "*(Nota: Se excluyeron días de asueto nacional y la semana de asueto gubernamental de Semana Santa).*\n\n"

markdown += "| Fecha | Fase del Proyecto | Trabajo Realizado | No. Horas por Actividad | Total Horas Día | Máquina, Herramienta y Equipo Utilizado |\n"
markdown += "| :--- | :--- | :--- | :---: | :---: | :--- |\n"

day_index = 0
for phase in phases:
    for _ in range(phase["days"]):
        if day_index >= len(final_days):
            break
            
        day = final_days[day_index]
        hours_today = 8
        
        t1 = random.choice(phase["tasks"])
        t2 = random.choice(phase["tasks"])
        while t2 == t1:
            t2 = random.choice(phase["tasks"])
            
        desc = f"• {t1}<br>• {t2}"
        equip = phase["equip"]
        hours_col = "4<br><br>4"
        
        date_str = day.strftime("%d/%m/%Y")
        markdown += f"| {date_str} | **{phase['name']}** | {desc} | {hours_col} | {hours_today} | {equip} |\n"
        
        day_index += 1

with open('C:\\Users\\tmoyy\\.gemini\\antigravity\\brain\\73da1f11-c75a-437d-9b74-3dc1f200007b\\ficha_horas_640h_cronologica.md', 'w', encoding='utf-8') as f:
    f.write(markdown)

print("Cronological file generated.")
