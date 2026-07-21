import datetime
import random
import math

start_date = datetime.date(2026, 1, 27)
end_date = datetime.date(2026, 7, 21)

# Semana Santa 2026: Lunes 30 Marzo al Viernes 3 de Abril
holy_week_start = datetime.date(2026, 3, 30)
holy_week_end = datetime.date(2026, 4, 3)

holidays = [
    datetime.date(2026, 6, 17)  # Día del padre
]

tasks_pool = [
    ("Reuniones de planificación y levantamiento de requerimientos del sistema de transporte.", "Laptop, Libreta, Teams/Zoom"),
    ("Configuración inicial del entorno de desarrollo local. Instalación de Node.js, Composer y Laravel.", "Laptop, VS Code, Terminal"),
    ("Diseño de la arquitectura de la base de datos y creación de los modelos iniciales.", "Laptop, DBeaver, MySQL"),
    ("Creación de la estructura del proyecto frontend en React y configuración de Tailwind CSS.", "Laptop, VS Code, Node.js"),
    ("Desarrollo de las primeras vistas de usuario (UI) para el sistema web de aprobaciones.", "Laptop, VS Code, Navegador Web"),
    ("Creación de migraciones y factorías en Laravel para la base de datos del sistema.", "Laptop, Laravel Artisan, PHP"),
    ("Desarrollo de APIs RESTful para la gestión de usuarios y roles dentro del sistema.", "Laptop, Postman, VS Code"),
    ("Integración del sistema de autenticación con Laravel Sanctum y manejo de sesiones seguras.", "Laptop, Chrome DevTools, Postman"),
    ("Implementación de navegación en el frontend usando React Router y creación de menús laterales.", "Laptop, VS Code, React"),
    ("Desarrollo del módulo web de solicitudes de transporte. Creación de formularios dinámicos.", "Laptop, VS Code, Chrome"),
    ("Pruebas de conectividad entre el cliente (Frontend) y el servidor (Backend). Manejo de políticas CORS.", "Laptop, Chrome Network Tab"),
    ("Refactorización de componentes de React para hacer el código más limpio y modular.", "Laptop, VS Code, React DevTools"),
    ("Configuración de servicios de geolocalización o mapas genéricos para rutas del sistema.", "Laptop, Navegador Web"),
    ("Desarrollo de la aplicación para los perfiles operativos. Adaptación de vistas para pantallas móviles.", "Laptop, Modo Móvil Chrome"),
    ("Implementación de validaciones de seguridad en los formularios de ambas plataformas (Front/Back).", "Laptop, VS Code"),
    ("Programación de la lógica para la subida y almacenamiento seguro de documentos adjuntos.", "Laptop, Postman, VS Code"),
    ("Optimización del frontend para cumplir con los estándares de Progressive Web App (PWA).", "Laptop, Lighthouse, Chrome DevTools"),
    ("Corrección de errores reportados (Bug Fixing) en la etapa de pruebas internas del sistema.", "Laptop, VS Code, Terminal"),
    ("Configuración del servidor de pruebas en entorno Linux. Creación de bloques en Nginx.", "Servidor de pruebas, SSH, Nginx"),
    ("Pruebas generales del flujo completo del sistema. Documentación del código fuente y cierre de etapa.", "Laptop, Git, Markdown")
]

valid_days = []
current = start_date

while current <= end_date:
    # 1=Martes, 2=Miercoles, 3=Jueves
    if current.weekday() in [1, 2, 3]:
        # Check Holy week
        if holy_week_start <= current <= holy_week_end:
            current += datetime.timedelta(days=1)
            continue
        # Check specific holidays
        if current in holidays:
            current += datetime.timedelta(days=1)
            continue
        
        valid_days.append(current)
        
    current += datetime.timedelta(days=1)

num_days = len(valid_days)
total_hours = 640

# Distribución de horas:
base_hours = total_hours // num_days
remainder = total_hours % num_days

markdown = "# Ficha de Horas Prácticas (640 Horas)\n\n"
markdown += "### Datos Generales\n"
markdown += "- **Estudiante:** [Tu Nombre]\n"
markdown += "- **Período:** 27 de Enero 2026 - 21 de Julio 2026\n"
markdown += "- **Jornada:** Martes, Miércoles y Jueves\n"
markdown += "- **Total Horas:** 640\n\n"

markdown += "*(Nota: Se excluyeron días de asueto nacional y la semana de asueto gubernamental de Semana Santa).*\n\n"

markdown += "| Fecha | Trabajo Realizado | No. Horas por Actividad | Total Horas Día | Máquina, Herramienta y Equipo Utilizado |\n"
markdown += "| :--- | :--- | :---: | :---: | :--- |\n"

for i, day in enumerate(valid_days):
    hours_today = base_hours
    if i < remainder:
        hours_today += 1
        
    # Split task if more than 5 hours to look realistic
    task1 = random.choice(tasks_pool)
    task2 = random.choice(tasks_pool)
    while task2 == task1:
        task2 = random.choice(tasks_pool)
        
    half_h1 = math.ceil(hours_today / 2)
    half_h2 = hours_today - half_h1
    
    desc = f"• {task1[0]}<br>• {task2[0]}"
    equip = f"{task1[1]}<br>{task2[1]}"
    equip_list = list(set(equip.replace("<br>", ", ").split(", ")))
    equip_str = ", ".join(equip_list)
    hours_col = f"{half_h1}<br><br>{half_h2}"
    
    date_str = day.strftime("%d/%m/%Y")
    markdown += f"| {date_str} | {desc} | {hours_col} | {hours_today} | {equip_str} |\n"

with open('C:\\Users\\tmoyy\\.gemini\\antigravity\\brain\\73da1f11-c75a-437d-9b74-3dc1f200007b\\ficha_horas_640h.md', 'w', encoding='utf-8') as f:
    f.write(markdown)

print(f"File generated. Total Valid Days: {num_days}. Total Hours: {total_hours}")
