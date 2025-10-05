// ========================================
// SCRIPT REGISTRO
// ========================================

import { addUser, isAuthenticated } from './storage.js';

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
      window.location.href = 'login.html';
    }
  }, 2000);
}

// Indicador de fortaleza de contraseña
passwordInput.addEventListener('input', (e) => {
  const password = e.target.value;
  let strength = 0;
  
  if (password.length >= 6) strength++;
  if (password.length >= 10) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z\d]/.test(password)) strength++;
  
  const colors = ['#dc3545', '#ffc107', '#28a745'];
  const widths = ['33%', '66%', '100%'];
  
  if (strength === 0) {
    passwordStrength.style.width = '0';
    passwordStrength.style.backgroundColor = '';
  } else if (strength <= 2) {
    passwordStrength.style.width = widths[0];
    passwordStrength.style.backgroundColor = colors[0];
  } else if (strength <= 3) {
    passwordStrength.style.width = widths[1];
    passwordStrength.style.backgroundColor = colors[1];
  } else {
    passwordStrength.style.width = widths[2];
    passwordStrength.style.backgroundColor = colors[2];
  }
});

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
    showAlert('¡Cuenta creada exitosamente! Redirigiendo al login...', 'success');
  }
});