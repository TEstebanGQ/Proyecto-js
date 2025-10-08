/* ===================================
   HABITACIONES.JS - SIMPLIFICADO
   Funcionalidad básica de la página
   =================================== */

document.addEventListener('DOMContentLoaded', function() {
    
    // Animación al hacer scroll para el navbar
    window.addEventListener('scroll', function() {
        const navbar = document.getElementById('mainNav');
        if (navbar) {
            if (window.scrollY > 100) {
                navbar.classList.add('navbar-scrolled');
            } else {
                navbar.classList.remove('navbar-scrolled');
            }
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
    const roomCards = document.querySelectorAll('.room-card');
    roomCards.forEach((card, index) => {
        card.parentElement.dataset.delay = index * 100;
        observer.observe(card.parentElement);
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

    // Efecto parallax en hero section
    window.addEventListener('scroll', function() {
        const hero = document.querySelector('.hero-section');
        if (hero) {
            const scrolled = window.pageYOffset;
            hero.style.backgroundPositionY = scrolled * 0.5 + 'px';
        }
    });

    console.log('Página de habitaciones cargada correctamente');
});