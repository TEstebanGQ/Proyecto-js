// ========================================
// SISTEMA DE NAVBAR CONSISTENTE
// Guardar como: js/navbar.js
// ========================================

// Verificar si el usuario está autenticado
function checkAuth() {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  const userMenuItem = document.getElementById('userMenuItem');
  const userName = document.getElementById('userName');
  const profileName = document.getElementById('profileName');
  const profileEmail = document.getElementById('profileEmail');
  
  if (user && userMenuItem) {
    // Usuario autenticado - mostrar dropdown con nombre
    userMenuItem.innerHTML = `
      <div class="nav-item dropdown">
        <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
          <i class="bi bi-person-circle"></i> ${user.nombre}
        </a>
        <ul class="dropdown-menu dropdown-menu-end">
          <li>
            <a class="dropdown-item" href="mis-reservas.html">
              <i class="bi bi-calendar-check"></i> Mis Reservas
            </a>
          </li>
          <li><hr class="dropdown-divider"></li>
          <li>
            <a class="dropdown-item" href="#" id="logoutBtn">
              <i class="bi bi-box-arrow-right"></i> Cerrar Sesión
            </a>
          </li>
        </ul>
      </div>
    `;
    
    // Agregar evento de logout
    setTimeout(() => {
      const logoutBtn = document.getElementById('logoutBtn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
          e.preventDefault();
          logout();
        });
      }
    }, 100);
  } else if (userMenuItem) {
    // Usuario no autenticado - mostrar botón de login
    userMenuItem.innerHTML = `
      <a class="nav-link" href="login.html">
        <i class="bi bi-person-circle"></i> Ingresar
      </a>
    `;
  }
  
  // Actualizar nombre de usuario en páginas de perfil
  if (userName && user) {
    userName.textContent = user.nombre;
  }
  
  if (profileName && user) {
    profileName.textContent = user.nombre;
  }
  
  if (profileEmail && user) {
    profileEmail.textContent = user.email;
  }
}

// Función de logout
function logout() {
  if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
  }
}

// Marcar el enlace activo según la página actual
function setActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link:not(.dropdown-toggle)');
  
  navLinks.forEach(link => {
    link.classList.remove('active');
    
    const href = link.getAttribute('href');
    if (!href) return;
    
    // Extraer solo el nombre del archivo
    const linkPage = href.split('/').pop().split('#')[0];
    
    // Comparar con la página actual
    if (linkPage === currentPage || 
        (currentPage === '' && linkPage === 'index.html') ||
        (currentPage === 'index.html' && linkPage === 'index.html')) {
      link.classList.add('active');
    }
  });
  
  // Marcar activo en dropdown items de mis-reservas.html
  const dropdownItems = document.querySelectorAll('.dropdown-menu .dropdown-item');
  dropdownItems.forEach(item => {
    item.classList.remove('active');
    const href = item.getAttribute('href');
    if (href) {
      const itemPage = href.split('/').pop().split('#')[0];
      if (itemPage === currentPage) {
        item.classList.add('active');
      }
    }
  });
}

// Efecto scroll del navbar
function initNavbarScroll() {
  const nav = document.getElementById('mainNav');
  if (!nav) return;
  
  // Determinar si la página tiene hero carousel
  const hasHeroCarousel = document.getElementById('heroCarousel') !== null;
  
  if (hasHeroCarousel) {
    // En index.html con carousel - navbar transparente al inicio
    window.addEventListener('scroll', function() {
      if (window.scrollY > 100) {
        nav.classList.add('navbar-scrolled');
      } else {
        nav.classList.remove('navbar-scrolled');
      }
    });
  } else {
    // En otras páginas - navbar siempre con fondo oscuro
    nav.classList.add('navbar-scrolled');
  }
}

// Smooth scroll para enlaces internos
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      
      // Ignorar enlaces vacíos, solo "#", o dropdown toggles
      if (href === '#' || href === '' || this.classList.contains('dropdown-toggle')) return;
      
      e.preventDefault();
      const target = document.querySelector(href);
      
      if (target) {
        const offsetTop = target.offsetTop - 70; // 70px para compensar el navbar fixed
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
        
        // Cerrar el navbar mobile si está abierto
        const navbarCollapse = document.getElementById('navbarNav');
        if (navbarCollapse && navbarCollapse.classList.contains('show')) {
          const bsCollapse = new bootstrap.Collapse(navbarCollapse);
          bsCollapse.hide();
        }
      }
    });
  });
}

// Inicializar menú móvil (CORREGIDO - con validaciones)
function initMobileMenu() {
  const toggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');
  
  // Solo agregar listener si ambos elementos existen
  if (toggle && navMenu) {
    toggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }
}

// Inicializar todo cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  checkAuth();
  setActiveNavLink();
  initNavbarScroll();
  initSmoothScroll();
  initMobileMenu(); // Ahora con validación
});

// Exportar funciones para uso en otros scripts
if (typeof window !== 'undefined') {
  window.NavbarSystem = {
    checkAuth,
    logout,
    setActiveNavLink
  };
}