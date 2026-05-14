# Guía de Instalación y Configuración - Sistema de Transporte

Este documento detalla los pasos necesarios para instalar y ejecutar el proyecto **Asamblea Transporte** en una nueva computadora.

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado lo siguiente:

1.  **Node.js**: Se recomienda la versión **18.x** o superior (LTS). Puedes descargarlo en [nodejs.org](https://nodejs.org/).
2.  **npm**: Viene incluido con Node.js.
3.  **Editor de Código**: Se recomienda [Visual Studio Code](https://code.visualstudio.com/).

---

## 🚀 Pasos para la Instalación

Si has recibido la carpeta del proyecto comprimida o directamente, sigue estos pasos:

### 1. Preparar la Carpeta
Copia la carpeta del proyecto a la ubicación deseada en tu disco duro (ejemplo: `C:\Proyectos\transporte-frontend`).

### 2. Abrir una Terminal
Abre una terminal (CMD, PowerShell o la terminal integrada de VS Code) y navega hasta la raíz del proyecto:
```bash
cd ruta/a/tu/carpeta/frontend-transporte
```

### 3. Instalar Dependencias
Ejecuta el siguiente comando para instalar todas las librerías necesarias:
```bash
npm install
```
*Este proceso puede tardar unos minutos dependiendo de tu conexión a internet.*

### 4. Configuración de Variables de Entorno
Asegúrate de que el archivo `.env` exista en la raíz del proyecto. Si no existe, puedes crear uno nuevo con el siguiente contenido:

```env
VITE_API_BASE_URL=https://phplaravel-1581457-6197806.cloudwaysapps.com
```
*Nota: Si necesitas apuntar a un servidor local o de pruebas, cambia esta URL.*

---

## 💻 Comandos de Desarrollo

Una vez instaladas las dependencias, puedes usar los siguientes comandos:

### Ejecutar en modo desarrollo
Para iniciar el sistema y verlo en tu navegador:
```bash
npm run dev
```
El sistema estará disponible usualmente en `http://localhost:5173`.

### Generar versión de producción
Para crear los archivos finales listos para subir a un servidor:
```bash
npm run build
```
Esto generará una carpeta llamada `dist/` con todo el código optimizado.

### Previsualizar versión de producción
Para probar la carpeta `dist` localmente:
```bash
npm run preview
```

---

## 🛠️ Tecnologías Utilizadas

- **Vite**: Herramienta de construcción ultra rápida.
- **React 19**: Biblioteca para la interfaz de usuario.
- **TypeScript**: Tipado estático para JavaScript.
- **Tailwind CSS**: Framework de diseño para estilos modernos.
- **Framer Motion**: Animaciones fluidas y profesionales.
- **Lucide React**: Iconografía moderna.
- **Leaflet**: Mapas interactivos para el seguimiento de transporte.
- **Vite PWA**: Soporte para Aplicación Web Progresiva (instalable).

---

## ⚠️ Notas Adicionales
- Si encuentras errores de permisos al instalar, intenta ejecutar la terminal como **Administrador**.
- Si el proyecto usa una versión específica de Node, puedes usar `nvm` para gestionarla.
