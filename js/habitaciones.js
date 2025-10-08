/* ===================================
   HABITACIONES.JS
   Funcionalidad de filtros dinámicos
   =================================== */

document.addEventListener('DOMContentLoaded', function() {
    
    // Obtener todos los botones de filtro
    const filterButtons = document.querySelectorAll('.filter-btn');
    const roomItems = document.querySelectorAll('.room-item');

    // Agregar evento click a cada botón
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filterValue = this.getAttribute('data-filter');
            
            // Remover clase 'active' de todos los botones
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Agregar clase 'active' al botón clickeado
            this.classList.add('active');
            
            // Filtrar habitaciones
            filterRooms(filterValue);
        });
    });

    // Función para filtrar habitaciones
    function filterRooms(category) {
        roomItems.forEach(item => {
            const itemCategory = item.getAttribute('data-category');
            
            if (category === 'all') {
                // Mostrar todas las habitaciones
                item.style.display = 'block';
                setTimeout(() => {
                    item.classList.remove('hidden');
                }, 10);
            } else {
                // Mostrar solo la categoría seleccionada
                if (itemCategory === category) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.classList.remove('hidden');
                    }, 10);
                } else {
                    item.classList.add('hidden');
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 500);
                }
            }
        });
    }

    // Animación al hacer scroll
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Efecto de entrada para las tarjetas al cargar la página
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '0';
                entry.target.style.transform = 'translateY(30px)';
                
                setTimeout(() => {
                    entry.target.style.transition = 'all 0.6s ease';
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, entry.target.dataset.delay || 0);
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Aplicar delay escalonado a las tarjetas
    roomItems.forEach((item, index) => {
        item.dataset.delay = index * 100;
        observer.observe(item);
    });

    // Smooth scroll para los enlaces
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Contador animado para mostrar número de habitaciones
    function animateCounter() {
        const visibleRooms = document.querySelectorAll('.room-item:not(.hidden)').length;
        const counterElement = document.querySelector('.rooms-counter');
        
        if (counterElement) {
            let count = 0;
            const interval = setInterval(() => {
                if (count >= visibleRooms) {
                    clearInterval(interval);
                } else {
                    count++;
                    counterElement.textContent = count;
                }
            }, 100);
        }
    }

    // Tooltip para badges
    const badges = document.querySelectorAll('.badge');
    badges.forEach(badge => {
        badge.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
        });
        badge.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });

    // Efecto parallax en hero section (opcional)
    window.addEventListener('scroll', function() {
        const hero = document.querySelector('.hero-section');
        if (hero) {
            const scrolled = window.pageYOffset;
            hero.style.backgroundPositionY = scrolled * 0.5 + 'px';
        }
    });

    // Loading state para botones
    const detailButtons = document.querySelectorAll('.btn-details');
    detailButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Agregar clase de loading (opcional)
            this.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Cargando...';
        });
    });

    console.log('Sistema de filtros de habitaciones cargado correctamente');
});