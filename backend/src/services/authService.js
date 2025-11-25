const jwt = require('jsonwebtoken');
const { User } = require('../models');

class AuthService {
  // Generar token JWT
  generateToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  // Verificar token
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Token inválido');
    }
  }

  // Login
  async login(email, password, role = null) {
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    // Validar que el usuario tenga un rol asignado
    if (!user.role || (user.role !== 'student' && user.role !== 'teacher')) {
      throw new Error('El usuario no tiene un rol válido asignado. Contacta al administrador.');
    }

    // Si se proporciona un rol, validar que coincida
    if (role && user.role !== role) {
      throw new Error(`El usuario es ${user.role === 'student' ? 'estudiante' : 'profesor'}, pero seleccionaste ${role === 'student' ? 'estudiante' : 'profesor'}.`);
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Credenciales inválidas');
    }

    const token = this.generateToken(user.id);
    return {
      user: user.toJSON(),
      token
    };
  }

  // Register
  async register(userData) {
    const { email, password, name, role, classCode, age, gender } = userData;

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    // Generar ID único
    const id = role === 'teacher' 
      ? `teacher_${Date.now()}`
      : `student_${Date.now()}`;

    const user = await User.create({
      id,
      email,
      password,
      name,
      role,
      classCode: classCode || null,
      age: age || null,
      gender: gender || null
    });

    const token = this.generateToken(user.id);
    return {
      user: user.toJSON(),
      token
    };
  }
}

module.exports = new AuthService();





