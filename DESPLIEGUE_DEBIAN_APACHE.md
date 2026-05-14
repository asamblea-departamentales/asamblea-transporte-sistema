# Despliegue en Debian + Apache (HTTPS)

Guía completa para desplegar el frontend de transporte en un servidor Debian con Apache y SSL.

---

## 1. Requisitos previos

```bash
sudo apt update && sudo apt upgrade -y
```

Asegúrate de tener Apache instalado:
```bash
sudo apt install apache2 -y
```

## 2. Habilitar módulos necesarios

El sistema necesita módulos especiales para el SPA routing y para el proxy de los mapas (Nominatim/OSRM):

```bash
sudo a2enmod rewrite
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod ssl
sudo a2enmod headers
```

Reiniciar Apache después de activar módulos:
```bash
sudo systemctl restart apache2
```

## 3. Subir los archivos de la aplicación

En tu máquina de desarrollo, genera el build de producción:
```bash
npm run build
```

Esto genera la carpeta `dist/`. Sube su contenido al servidor, por ejemplo a `/var/www/html/`:

```bash
# Opción A: Desde tu PC local con SCP
scp -r dist/* usuario@IP_SERVIDOR:/var/www/html/

# Opción B: Si usas FileZilla, sube el contenido de dist/ a /var/www/html/
```

Ajustar permisos:
```bash
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html
```

## 4. Crear el archivo .htaccess

Crear el archivo `/var/www/html/.htaccess` con el siguiente contenido.
Este archivo es **crítico** para que funcione la navegación SPA (React Router):

```bash
sudo nano /var/www/html/.htaccess
```

Contenido:
```apache
RewriteEngine On
RewriteBase /

# Si el archivo o directorio existe, sirve directamente (JS, CSS, imágenes, etc.)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d

# Todo lo demás redirige a index.html (SPA routing)
RewriteRule . /index.html [L]
```

## 5. Configurar el VirtualHost (HTTPS)

Editar tu archivo de configuración:

```bash
sudo nano /etc/apache2/sites-available/transporte-ssl.conf
```

Reemplazar **todo** el contenido con esto:

```apache
<VirtualHost *:443>
    ServerName transporte.com
    ServerAlias www.transporte.com
    DocumentRoot /var/www/html

    # ─── SSL ───────────────────────────────────────────────
    SSLEngine on
    SSLCertificateFile /etc/ssl/certs/apache-selfsigned.crt
    SSLCertificateKeyFile /etc/ssl/private/apache-selfsigned.key

    # ─── SPA: React Router ─────────────────────────────────
    <Directory /var/www/html>
        AllowOverride All
        Require all granted
    </Directory>

    # ─── PROXY: Mapas (Nominatim + OSRM) ──────────────────
    # Sin esto, los mapas en la página de detalle NO funcionarán.
    # El frontend hace peticiones a /nominatim/ y /osrm/
    # y Apache las redirige a los servidores públicos.

    ProxyPreserveHost Off

    ProxyPass        /nominatim/ https://nominatim.openstreetmap.org/
    ProxyPassReverse /nominatim/ https://nominatim.openstreetmap.org/

    ProxyPass        /osrm/ https://router.project-osrm.org/
    ProxyPassReverse /osrm/ https://router.project-osrm.org/

    # ─── Seguridad ─────────────────────────────────────────
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-Frame-Options "DENY"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"

    # ─── Logs ──────────────────────────────────────────────
    ErrorLog ${APACHE_LOG_DIR}/transporte-error.log
    CustomLog ${APACHE_LOG_DIR}/transporte-access.log combined
</VirtualHost>

# Redirigir HTTP a HTTPS
<VirtualHost *:80>
    ServerName transporte.com
    ServerAlias www.transporte.com
    Redirect permanent / https://transporte.com/
</VirtualHost>
```

## 6. Activar el sitio y reiniciar

```bash
# Desactivar sitio por defecto
sudo a2dissite 000-default.conf

# Activar tu sitio
sudo a2ensite transporte-ssl.conf

# Verificar que la configuración no tenga errores de sintaxis
sudo apache2ctl configtest

# Reiniciar Apache
sudo systemctl restart apache2
```

Si `configtest` dice **Syntax OK**, todo está bien.

## 7. Verificación

1. Abrir `https://IP_DEL_SERVIDOR` en el navegador.
2. Si usas certificado auto-firmado, aceptar la advertencia del navegador.
3. Verificar que puedes navegar entre páginas (Dashboard, Solicitudes, etc.) sin error 404.
4. Abrir el detalle de una solicitud de transporte y verificar que el mapa carga correctamente.

## 8. Solución de problemas comunes

| Problema | Solución |
|----------|----------|
| Pantalla en blanco | Verificar que los archivos de `dist/` están en `/var/www/html/` y no dentro de una subcarpeta extra |
| Error 404 al recargar una página | El `.htaccess` no está funcionando. Verificar que `AllowOverride All` está en el VirtualHost y que `mod_rewrite` está habilitado |
| Mapa no carga en detalle de solicitud | Verificar que `mod_proxy` y `mod_proxy_http` están habilitados y que las reglas ProxyPass están en el VirtualHost |
| Error "VITE_API_BASE_URL" | El build debe hacerse con el archivo `.env.production` presente. Regenerar con `npm run build` |
| Error de SSL en proxy | Ejecutar `sudo a2enmod ssl` y reiniciar Apache |
