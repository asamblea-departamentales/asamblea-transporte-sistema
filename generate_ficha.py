import datetime
import random

start_date = datetime.date(2026, 1, 27)
holidays = [
    datetime.date(2026, 4, 2),  # Jueves Santo
    datetime.date(2026, 4, 3),  # Viernes Santo
    datetime.date(2026, 5, 1),  # Día del trabajo
    datetime.date(2026, 6, 17)  # Día del padre
]

tasks_pool = [
    ("Configuración de entorno local, instalación de Node.js, Composer y Laravel. Clonado de repositorios desde GitHub.", "Laptop, VS Code, Git, Terminal"),
    ("Análisis del código base y estructura del proyecto en React y Laravel. Revisión de documentación técnica.", "Laptop, Navegador, VS Code"),
    ("Desarrollo de interfaces de usuario (UI) usando Tailwind CSS. Maquetado de vistas para el sistema de solicitudes.", "Laptop, VS Code, Chrome DevTools"),
    ("Refactorización de componentes React para mejorar la reusabilidad en el frontend de Jefatura y Motoristas.", "Laptop, VS Code, React DevTools"),
    ("Implementación de rutas en el Frontend usando React Router. Creación de layouts principales y menús laterales (Sidebar).", "Laptop, VS Code"),
    ("Integración de APIs RESTful creadas en Laravel. Pruebas de endpoints usando Postman.", "Laptop, VS Code, Postman"),
    ("Desarrollo del módulo de autenticación. Manejo de tokens de sesión con Laravel Sanctum y almacenamiento en sessionStorage.", "Laptop, VS Code, Chrome DevTools"),
    ("Corrección de errores de interfaz y ajustes de diseño responsivo para dispositivos móviles (PWA).", "Laptop, Dispositivo Móvil, VS Code"),
    ("Configuración del archivo manifest.json y etiquetas meta en index.html para estandarización de Progressive Web App (PWA).", "Laptop, VS Code"),
    ("Desarrollo del submódulo de estado de disponibilidad para motoristas. Diseño del formulario de incapacidad.", "Laptop, VS Code"),
    ("Implementación de validaciones en formularios Frontend (motivos obligatorios, campos requeridos).", "Laptop, VS Code"),
    ("Desarrollo de la lógica para subida de archivos (atestados médicos). Configuración de peticiones con 'multipart/form-data' mediante Axios.", "Laptop, VS Code, Postman"),
    ("Resolución de errores de compilación en Node.js (ERESOLVE en Vite y dependencias legacy).", "Laptop, Terminal Bash"),
    ("Modificación y actualización de migraciones en base de datos MySQL (Ej. Hacer el campo DUI nullable).", "Laptop, DBeaver/phpMyAdmin, Laravel Artisan"),
    ("Pruebas de conexión entre el servidor frontend y el backend. Diagnóstico y resolución de problemas de CORS.", "Laptop, Chrome Network Tab, VS Code"),
    ("Configuración de servidor Nginx local. Creación de Server Blocks para proxies inversos (puertos 443, 7443, 8443).", "Servidor Ubuntu, SSH, Nano"),
    ("Actualización de direcciones IP y despliegue continuo usando git pull y npm run build en servidor interno.", "Servidor Ubuntu, Terminal Bash"),
    ("Depuración de errores 500 en Laravel. Revisión de laravel.log y corrección de variables de entorno (.env).", "Laptop, Terminal SSH"),
    ("Pruebas de flujo completo: Creación de solicitud, asignación a motorista, y confirmación de viaje.", "Laptop, Navegador web"),
    ("Documentación técnica y cierre de tickets. Reuniones de revisión de código y ajustes finales de UX/UI.", "Laptop, Git, VS Code")
]

hours_needed = 660
current_hours = 0
current_date = start_date

markdown = "# Ficha de Horas Prácticas (660 Horas)\n\n"
markdown += "### Datos Generales\n"
markdown += "- **Estudiante:** [Tu Nombre]\n"
markdown += "- **Período:** 27 de Enero 2026 - 20 de Julio 2026\n"
markdown += "- **Total Horas:** 660\n\n"

markdown += "| Fecha | Trabajo Realizado | No. Horas por Actividad | Total Horas Día | Máquina, Herramienta y Equipo Utilizado |\n"
markdown += "| :--- | :--- | :---: | :---: | :--- |\n"

while current_hours < hours_needed:
    # Skip weekends
    if current_date.weekday() >= 5:
        current_date += datetime.timedelta(days=1)
        continue
    # Skip holidays
    if current_date in holidays:
        current_date += datetime.timedelta(days=1)
        continue
    
    hours_today = 8
    if current_hours + hours_today > hours_needed:
        hours_today = hours_needed - current_hours

    if hours_today == 8:
        task1 = random.choice(tasks_pool)
        task2 = random.choice(tasks_pool)
        while task2 == task1:
            task2 = random.choice(tasks_pool)
        
        desc = f"• {task1[0]}<br>• {task2[0]}"
        equip = f"{task1[1]}<br>{task2[1]}"
        equip_list = list(set(equip.replace("<br>", ", ").split(", ")))
        equip_str = ", ".join(equip_list)
        hours_col = "4<br><br>4"
    else:
        task = random.choice(tasks_pool)
        desc = f"• {task[0]}"
        equip_str = task[1]
        hours_col = str(hours_today)

    date_str = current_date.strftime("%d/%m/%Y")
    markdown += f"| {date_str} | {desc} | {hours_col} | {hours_today} | {equip_str} |\n"
    
    current_hours += hours_today
    current_date += datetime.timedelta(days=1)

with open('ficha_horas.md', 'w', encoding='utf-8') as f:
    f.write(markdown)

print(f"File generated. Last date reached: {current_date - datetime.timedelta(days=1)}")
