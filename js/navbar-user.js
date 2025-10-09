// ========================================
// NAVBAR - Menú de Usuario
// Guardar como: js/navbar-user.js
// ========================================

/**
 * Verifica si hay un usuario autenticado
 * @returns {Object|null} Objeto de usuario o null si no está autenticado
 */
function checkAuth() {
  try {
    const userStr = localStorage.getItem('hotel_current_user');
    if (!userStr) return null;
    
    const user = JSON.parse(userStr);
    
    // Validar que tenga los campos requeridos
    if (!user || !user.id || !user.email || !user.nombre) {
      console.warn('Usuario inválido en localStorage');
      localStorage.removeItem('hotel_current_user');
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Error al verificar autenticación:', error);
    localStorage.removeItem('hotel_current_user');
    return null;
  }
}

/**
 * Obtiene el primer nombre del usuario
 * @param {string} fullName - Nombre completo del usuario
 * @returns {string} Primer nombre o 'Usuario' por defecto
 */
function getFirstName(fullName) {
  if (!fullName) return 'Usuario';
  return fullName.trim().split(' ')[0];
}

/**
 * Cierra la sesión del usuario
 */
function performLogout() {
  // Limpiar todas las claves relacionadas con autenticación
  localStorage.removeItem('hotel_current_user');
  localStorage.removeItem('currentUser');
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userName');
  localStorage.removeItem('userId');
  sessionStorage.clear();
  
  console.log('Sesión cerrada correctamente');
  
  // Redirigir al inicio
  window.location.href = 'index.html';
}

/**
 * Actualiza el menú de usuario en el navbar
 */
function updateUserMenu() {
  const userMenuItem = document.getElementById('userMenuItem');
  if (!userMenuItem) {
    console.warn('Elemento #userMenuItem no encontrado en el DOM');
    return;
  }
  
  const user = checkAuth();
  
  if (user) {
    // Usuario autenticado - mostrar menú dropdown (SIN EMAIL)
    const firstName = getFirstName(user.nombre);
    
    userMenuItem.innerHTML = `
      <div class="nav-item dropdown">
        <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" 
           data-bs-toggle="dropdown" aria-expanded="false">
          <i class="bi bi-person-circle"></i> ${firstName}
        </a>
        <ul class="dropdown-menu dropdown-menu-end dropdown-menu-dark" aria-labelledby="userDropdown">
          <li>
            <a class="dropdown-item" href="mis-reservas.html">
              <i class="bi bi-calendar-check"></i> Mis Reservas
            </a>
          </li>
          <li><hr class="dropdown-divider"></li>
          <li>
            <a class="dropdown-item" href="#" id="navLogoutBtn">
              <i class="bi bi-box-arrow-right"></i> Cerrar Sesión
            </a>
          </li>
        </ul>
      </div>
    `;
    
    // Agregar event listener al botón de cerrar sesión
    const logoutBtn = document.getElementById('navLogoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
          performLogout();
        }
      });
    }
  } else {
    // Usuario no autenticado - mostrar botón de login
    userMenuItem.innerHTML = `
      <a class="nav-link" href="login.html">
        <i class="bi bi-person-circle"></i> Ingresar
      </a>
    `;
  }
}

// ========================================
// INICIALIZACIÓN
// ========================================

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', updateUserMenu);
} else {
  // Si el DOM ya está listo, ejecutar inmediatamente
  updateUserMenu();
}

// Actualizar cuando la página se muestre (navegación con botón atrás)
window.addEventListener('pageshow', (event) => {
  // Si la página viene del cache (bfcache), actualizar el menú
  if (event.persisted) {
    updateUserMenu();
  }
});

// Actualizar si cambia el estado de login en otra pestaña
window.addEventListener('storage', (e) => {
  if (e.key === 'hotel_current_user' || e.key === 'isLoggedIn') {
    updateUserMenu();
  }
});