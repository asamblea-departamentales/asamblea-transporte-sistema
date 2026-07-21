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

# Definimos las fases del proyecto con lenguaje estrictamente formal y enfocado en React, TS y Tailwind.
phases = [
    {
        "name": "Fase 1: Análisis Arquitectónico y Planificación de Requerimientos",
        "days": 10,
        "tasks": [
            "Levantamiento de requerimientos funcionales y no funcionales para la estructuración de las plataformas frontend del sistema de transporte.",
            "Análisis de viabilidad técnica y definición formal del stack tecnológico: React.js, TypeScript para el tipado estático, y Tailwind CSS para el diseño UI.",
            "Diseño arquitectónico de los módulos de software bajo el patrón MVC adaptado al cliente para: Administración, Aprobación y Motoristas.",
            "Modelado de interfaces de usuario mediante herramientas de wireframing y estructuración del flujo de experiencia de usuario (UX).",
            "Definición de convenciones de codificación, estándares de tipado estricto en TypeScript y reglas de linteo en el entorno de desarrollo."
        ],
        "equip": "Laptop, Libreta de Campo, Plataformas de Videoconferencia, Herramientas de Diseño UI"
    },
    {
        "name": "Fase 2: Estructuración e Inicialización de Entornos de Desarrollo",
        "days": 10,
        "tasks": [
            "Inicialización e instanciación del proyecto 'frontend-transporte' utilizando Node.js y la herramienta de empaquetado Vite.",
            "Inicialización e instanciación del proyecto 'Maprobacion-asamblea' implementando configuración inicial para React y TypeScript.",
            "Inicialización del entorno PWA 'asamblea-transporte-motorista' configurando el framework React bajo tipado estático.",
            "Instalación, configuración e integración del framework Tailwind CSS en los tres repositorios para el manejo de estilos utilitarios.",
            "Configuración del sistema de control de versiones con Git, inicialización de repositorios locales y enlace a la plataforma GitHub.",
            "Estructuración jerárquica de directorios del proyecto (src/components, src/hooks, src/interfaces, src/services) para el aislamiento de lógica modular."
        ],
        "equip": "Laptop, Terminal Bash, Git, Entorno de Desarrollo Integrado (VS Code), Node.js"
    },
    {
        "name": "Fase 3: Desarrollo de Capa de Presentación 'frontend-transporte'",
        "days": 15,
        "tasks": [
            "Desarrollo de layouts principales y enrutamiento dinámico (Client-Side Routing) haciendo uso de la librería React Router DOM.",
            "Desarrollo de componentes funcionales reutilizables en React garantizando el tipado de propiedades (Props) mediante interfaces de TypeScript.",
            "Integración y consumo de APIs RESTful mediante la librería Axios, empleando tipos de retorno explícitos (Promesas tipadas en TS).",
            "Gestión del estado global y local de la aplicación mediante React Hooks (useState, useEffect, useContext) para el módulo administrativo.",
            "Implementación de validaciones asíncronas en formularios y diseño responsivo de interfaces empleando las clases utilitarias de Tailwind CSS."
        ],
        "equip": "Laptop, VS Code, React Developer Tools, Navegador Web"
    },
    {
        "name": "Fase 4: Desarrollo de Capa de Presentación 'Maprobacion-asamblea'",
        "days": 15,
        "tasks": [
            "Implementación del módulo de autenticación asíncrona interactuando con Laravel Sanctum y gestión segura de tokens en almacenamiento local.",
            "Construcción del Dashboard interactivo utilizando componentes tipados para la revisión y filtrado de solicitudes de transporte.",
            "Desarrollo de las interfaces lógicas para las acciones de 'Aprobación' y 'Rechazo', implementando control de estados transicionales.",
            "Aplicación de diseño responsivo (Mobile-First) y consistencia visual en los componentes de interfaz haciendo uso de Tailwind CSS.",
            "Manejo de errores HTTP interceptados mediante Axios y renderizado condicional de componentes de retroalimentación visual al usuario."
        ],
        "equip": "Laptop, VS Code, Cliente API REST (Postman), Navegador Web"
    },
    {
        "name": "Fase 5: Desarrollo PWA 'asamblea-transporte-motorista'",
        "days": 15,
        "tasks": [
            "Diseño y desarrollo de la aplicación bajo el paradigma 'Mobile-First' utilizando Tailwind CSS para adaptabilidad en dispositivos móviles.",
            "Configuración técnica de etiquetas meta, archivo manifest.json y Service Workers para establecer el estándar Progressive Web App (PWA).",
            "Implementación de vistas interactivas en React para la gestión de rutas, controlando el ciclo de vida del componente durante los viajes.",
            "Desarrollo de submódulo de disponibilidad; programación de envío de datos binarios (archivos médicos) mediante 'multipart/form-data' tipado.",
            "Integración de librerías externas en React para la manipulación y renderizado de mapas interactivos o geolocalización."
        ],
        "equip": "Laptop, Dispositivo Móvil (Emuladores), VS Code, Herramienta de Auditoría Web (Lighthouse)"
    },
    {
        "name": "Fase 6: Integración, Pruebas DevOps y Proxy Inverso",
        "days": 10,
        "tasks": [
            "Ejecución de pruebas de integración cruzada entre los módulos de frontend (React) y la API Backend, garantizando la consistencia de datos.",
            "Diagnóstico, análisis técnico y resolución de bloqueos de políticas de mismo origen (CORS) durante las peticiones HTTP.",
            "Compilación y optimización de código fuente TypeScript a JavaScript nativo para despliegue en entornos de producción (npm run build).",
            "Configuración del servidor web Nginx en entorno Linux: Creación de bloques de servidor y proxies inversos seguros (Puertos 7443, 8443, 9443).",
            "Configuración e inyección de variables de entorno (.env.production) estrictas para garantizar la seguridad de los Endpoints."
        ],
        "equip": "Servidor Ubuntu Linux, Cliente SSH, Terminal Bash, Editor Nano, VS Code"
    },
    {
        "name": "Fase 7: Refactorización y Entrega de Documentación",
        "days": 5,
        "tasks": [
            "Depuración de errores lógicos (Bug Fixing) identificados durante la fase de pruebas de aceptación del usuario (UAT).",
            "Optimización de los tiempos de carga del DOM mediante técnicas de renderizado perezoso (Lazy Loading) y división de código (Code Splitting).",
            "Refactorización estricta del código fuente en TypeScript para eliminar dependencias obsoletas, advertencias de compilador y código muerto.",
            "Elaboración de documentación técnica formal de los proyectos React, incluyendo instrucciones de configuración, despliegue y arquitectura.",
            "Entrega oficial de los repositorios estabilizados mediante sistema de control de versiones y cierre formal del ciclo de desarrollo."
        ],
        "equip": "Laptop, VS Code, Git, Herramientas de Edición Markdown"
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

random.seed(999)
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

with open('C:\\Users\\tmoyy\\.gemini\\antigravity\\brain\\73da1f11-c75a-437d-9b74-3dc1f200007b\\ficha_horas_640h_formal.md', 'w', encoding='utf-8') as f:
    f.write(markdown)

print("Formal Cronological file generated.")
