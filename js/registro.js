// ========================================
// SCRIPT REGISTRO - CORREGIDO
// ========================================

import { addUser, isAuthenticated, login } from './storage.js';

// Redirigir si ya está autenticado
if (isAuthenticated()) {
  window.location.href = 'mis-reservas.html';
}

const form = document.getElementById('registerForm');
const alertContainer = document.getElementById('alertContainer');
const passwordInput = document.getElementById('password');
const passwordStrength = document.getElementById('passwordStrength');

function showAlert(message, type = 'danger') {
  alertContainer.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      <i class="bi bi-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i>
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
  
  setTimeout(() => {
    if (type === 'success') {
      window.location.href = 'index.html'; // Redirigir al inicio en lugar de login
    }
  }, 2000);
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const identificacion = document.getElementById('identificacion').value.trim();
  const nombre = document.getElementById('nombre').value.trim();
  const email = document.getElementById('email').value.trim();
  const telefono = document.getElementById('telefono').value.trim();
  const nacionalidad = document.getElementById('nacionalidad').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const terms = document.getElementById('terms').checked;
  
  // Validaciones
  if (!identificacion || !nombre || !email || !telefono || !nacionalidad || !password) {
    showAlert('Por favor completa todos los campos obligatorios');
    return;
  }
  
  if (password.length < 6) {
    showAlert('La contraseña debe tener al menos 6 caracteres');
    return;
  }
  
  if (password !== confirmPassword) {
    showAlert('Las contraseñas no coinciden');
    return;
  }
  
  if (!terms) {
    showAlert('Debes aceptar los términos y condiciones');
    return;
  }
  
  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showAlert('Por favor ingresa un email válido');
    return;
  }
  
  // Crear usuario
  const result = addUser({
    identificacion,
    nombre,
    email,
    telefono,
    nacionalidad,
    password
  });
  
  if (result.error) {
    showAlert(result.error);
  } else {
    // ✅ INICIAR SESIÓN AUTOMÁTICAMENTE DESPUÉS DEL REGISTRO
    const loginResult = login(email, password);
    
    if (loginResult.success) {
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userName', nombre);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userId', loginResult.user.id);
      
      showAlert('¡Cuenta creada exitosamente! Bienvenido...', 'success');
    } else {
      // Si falla el auto-login, redirigir a login manual
      showAlert('¡Cuenta creada exitosamente! Redirigiendo al login...', 'success');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
    }
  }
});