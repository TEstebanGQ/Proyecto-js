// ========================================
// NAVBAR - Mostrar Nombre de Usuario
// Guardar como: js/navbar-user.js
// ========================================

// Función para obtener el primer nombre del usuario
function getFirstName(fullName) {
  if (!fullName) return 'Usuario';
  return fullName.trim().split(' ')[0];
}

// Función para actualizar el menú de usuario en el navbar
function updateNavbarUser() {
  const userMenuItem = document.getElementById('userMenuItem');
  if (!userMenuItem) return;

  // Obtener datos del usuario desde localStorage
  const userEmail = localStorage.getItem('userEmail');
  const userName = localStorage.getItem('userName');
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  if (isLoggedIn && userName) {
    const firstName = getFirstName(userName);
    
    // Crear el menú dropdown para usuario logueado
    userMenuItem.innerHTML = `
      <div class="dropdown">
        <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button">
          <i class="bi bi-person-circle"></i> ${firstName}
        </a>
        <ul class="dropdown-menu dropdown-menu-end dropdown-menu-dark" aria-labelledby="userDropdown">
          <li>
            <a class="dropdown-item disabled" href="#">
              <i class="bi bi-envelope"></i> ${userEmail}
            </a>
          </li>
          <li><hr class="dropdown-divider"></li>
          <li>
            <a class="dropdown-item" href="mis-reservas.html">
              <i class="bi bi-calendar-check"></i> Mis Reservas
            </a>
          </li>
          <li>
            <a class="dropdown-item" href="#" id="logoutBtn">
              <i class="bi bi-box-arrow-right"></i> Cerrar Sesión
            </a>
          </li>
        </ul>
      </div>
    `;

    // Agregar evento de cerrar sesión
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Confirmar cierre de sesión
        if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
          // Limpiar localStorage
          localStorage.removeItem('userEmail');
          localStorage.removeItem('userName');
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('userId');
          
          // Redirigir al inicio
          window.location.href = 'index.html';
        }
      });
    }
  } else {
    // Usuario no logueado - mostrar botón de ingresar
    userMenuItem.innerHTML = `
      <a class="nav-link" href="login.html">
        <i class="bi bi-person-circle"></i> Ingresar
      </a>
    `;
  }
}

// Ejecutar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', updateNavbarUser);

// Actualizar si cambia el estado de login en otra pestaña
window.addEventListener('storage', (e) => {
  if (e.key === 'isLoggedIn' || e.key === 'userName') {
    updateNavbarUser();
  }
});