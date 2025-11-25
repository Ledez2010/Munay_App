INSTRUCCIONES DE INSTALACIÓN
============================

1. Subir todos los archivos a la carpeta api/ en el servidor

2. Conectarse por SSH al servidor

3. Navegar a la carpeta api:
   cd api

4. Instalar dependencias:
   npm install --production

5. Crear archivo .env con la configuración de la base de datos:
   cp .env.example .env
   nano .env
   
   Editar con tus credenciales de base de datos

6. Ejecutar migraciones (si es necesario):
   node migrations/001-initial-schema.js

7. Iniciar el servidor con PM2:
   pm2 start src/server.js --name munay-api
   pm2 save
   pm2 startup

8. Verificar que el servidor esté corriendo:
   pm2 status
   pm2 logs munay-api

IMPORTANTE:
- Asegúrate de que el puerto 3000 esté abierto en el firewall
- Verifica que la base de datos MySQL esté configurada correctamente
- El frontend debe apuntar a: https://tudominio.com/api
