/**
 * Script simple para probar que el servidor funciona
 * Ejecutar: node test-server.js
 */

const http = require('http');

console.log('🔍 Probando conexión al servidor...\n');

// Probar health endpoint
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/health',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`✅ Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`✅ Respuesta:`, data);
    console.log('\n✅ El servidor está respondiendo correctamente');
    console.log('\n🔍 Si el frontend sigue dando 404, verifica:');
    console.log('   1. Que el proxy reverso (Nginx/Apache) esté configurado');
    console.log('   2. Que la URL en config-api.js sea correcta');
    console.log('   3. Que el token JWT sea válido');
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error.message);
  console.error('\n⚠️  El servidor no está corriendo o no está accesible en el puerto 3000');
  console.error('\n📝 Solución:');
  console.error('   1. Verifica que el servidor esté corriendo: pm2 status');
  console.error('   2. Si no está corriendo: cd api && bash start.sh');
  console.error('   3. Verifica los logs: pm2 logs munay-api');
});

req.end();

