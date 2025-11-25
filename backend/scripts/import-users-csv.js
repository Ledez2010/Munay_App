#!/usr/bin/env node

/**
 * Script para importar usuarios desde un archivo CSV
 * 
 * Uso:
 *   node scripts/import-users-csv.js archivo.csv
 * 
 * Formato del CSV:
 *   name,email,password,role,classCode,age,gender
 *   Juan Pérez,juan@example.com,password123,student,CLS001,15,masculino
 *   María García,maria@example.com,password123,teacher,,,femenino
 * 
 * Campos requeridos: name, email, role
 * Campos opcionales: password, classCode, age, gender
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { User } = require('../src/models');
const { sequelize } = require('../src/config/database');

// Función para parsear CSV simple
function parseCSV(content) {
  const lines = content.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('El CSV debe tener al menos una fila de encabezados y una fila de datos');
  }

  const headers = lines[0].split(',').map(h => h.trim());
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length !== headers.length) {
      console.warn(`⚠️  Fila ${i + 1} tiene ${values.length} columnas, se esperaban ${headers.length}. Saltando...`);
      continue;
    }

    const row = {};
    headers.forEach((header, index) => {
      const value = values[index];
      // Convertir valores vacíos a null
      row[header] = value === '' ? null : value;
    });
    data.push(row);
  }

  return data;
}

// Función para validar usuario
function validateUser(userData, index) {
  const errors = [];

  if (!userData.name) {
    errors.push('Falta el campo "name"');
  }
  if (!userData.email) {
    errors.push('Falta el campo "email"');
  }
  if (!userData.role) {
    errors.push('Falta el campo "role"');
  }

  if (userData.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      errors.push('Email inválido');
    }
  }

  if (userData.role && !['student', 'teacher'].includes(userData.role)) {
    errors.push('Rol debe ser "student" o "teacher"');
  }

  if (userData.age && (isNaN(userData.age) || userData.age < 1 || userData.age > 100)) {
    errors.push('Edad debe ser un número entre 1 y 100');
  }

  return errors;
}

// Función principal
async function importUsers() {
  try {
    // Verificar argumentos
    const csvFile = process.argv[2];
    if (!csvFile) {
      console.error('❌ Error: Debes especificar el archivo CSV');
      console.log('\nUso: node scripts/import-users-csv.js archivo.csv');
      console.log('\nFormato del CSV:');
      console.log('  name,email,password,role,classCode,age,gender');
      console.log('  Juan Pérez,juan@example.com,password123,student,CLS001,15,masculino');
      process.exit(1);
    }

    // Verificar que el archivo existe
    const filePath = path.resolve(csvFile);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Error: El archivo "${csvFile}" no existe`);
      process.exit(1);
    }

    console.log('📂 Leyendo archivo CSV...');
    const content = fs.readFileSync(filePath, 'utf-8');
    const usersData = parseCSV(content);

    console.log(`📊 Encontrados ${usersData.length} usuarios en el CSV\n`);

    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos\n');

    const results = {
      created: [],
      errors: [],
      skipped: []
    };

    // Procesar usuarios
    console.log('🔄 Procesando usuarios...\n');
    for (let i = 0; i < usersData.length; i++) {
      const userData = usersData[i];
      const index = i + 2; // +2 porque la primera fila es encabezados y empezamos desde 1

      // Validar
      const validationErrors = validateUser(userData, index);
      if (validationErrors.length > 0) {
        results.errors.push({
          row: index,
          email: userData.email || 'N/A',
          errors: validationErrors
        });
        console.log(`❌ Fila ${index} (${userData.email || 'N/A'}): ${validationErrors.join(', ')}`);
        continue;
      }

      try {
        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ where: { email: userData.email } });
        if (existingUser) {
          results.skipped.push({
            row: index,
            email: userData.email,
            reason: 'Usuario ya existe'
          });
          console.log(`⏭️  Fila ${index} (${userData.email}): Usuario ya existe, saltando...`);
          continue;
        }

        // Generar contraseña por defecto si no se proporciona
        const password = userData.password || `temp${Date.now()}${i}${Math.random().toString(36).substr(2, 5)}`;

        // Crear usuario
        const user = await User.create({
          id: `user_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
          name: userData.name,
          email: userData.email,
          password: password,
          role: userData.role,
          classCode: userData.classCode || null,
          age: userData.age ? parseInt(userData.age) : null,
          gender: userData.gender || null,
          avatar: 'student'
        });

        results.created.push({
          row: index,
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          classCode: user.classCode
        });

        console.log(`✅ Fila ${index}: Usuario creado - ${user.name} (${user.email})`);

      } catch (error) {
        results.errors.push({
          row: index,
          email: userData.email || 'N/A',
          error: error.message
        });
        console.log(`❌ Fila ${index} (${userData.email || 'N/A'}): ${error.message}`);
      }
    }

    // Resumen
    console.log('\n' + '='.repeat(50));
    console.log('📊 RESUMEN DE IMPORTACIÓN');
    console.log('='.repeat(50));
    console.log(`Total procesados: ${usersData.length}`);
    console.log(`✅ Creados: ${results.created.length}`);
    console.log(`⏭️  Saltados: ${results.skipped.length}`);
    console.log(`❌ Errores: ${results.errors.length}`);

    if (results.errors.length > 0) {
      console.log('\n❌ ERRORES:');
      results.errors.forEach(err => {
        console.log(`  Fila ${err.row} (${err.email}): ${err.error || err.errors?.join(', ')}`);
      });
    }

    if (results.skipped.length > 0) {
      console.log('\n⏭️  SALTADOS:');
      results.skipped.forEach(skip => {
        console.log(`  Fila ${skip.row} (${skip.email}): ${skip.reason}`);
      });
    }

    console.log('\n✅ Importación completada');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (process.env.NODE_ENV === 'development') {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Ejecutar
importUsers();

