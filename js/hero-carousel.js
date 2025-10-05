// ========================================
// HERO CAROUSEL - FUNCIONALIDAD
// ========================================

document.addEventListener('DOMContentLoaded', function() {
  
  // Inicializar carrusel de Bootstrap
  const heroCarousel = document.getElementById('heroCarousel');
  
  if (heroCarousel) {
    const carousel = new bootstrap.Carousel(heroCarousel, {
      interval: 5000, // Cambiar cada 5 segundos
      ride: 'carousel',
      pause: 'hover', // Pausar al pasar el mouse
      wrap: true, // Loop infinito
      keyboard: true, // Control con teclado
      touch: true // Soporte táctil
    });
    
    // Scroll suave al hacer clic en el indicador de scroll
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
      scrollIndicator.addEventListener('click', function() {
        const nextSection = document.querySelector('.welcome-section');
        if (nextSection) {
          nextSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    }
    
    // Pausar el carrusel cuando no está visible (optimización)
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          carousel.cycle();
        } else {
          carousel.pause();
        }
      });
    }, {
      threshold: 0.5
    });
    
    observer.observe(heroCarousel);
    
    // Animación de entrada del contenido en cada slide
    heroCarousel.addEventListener('slide.bs.carousel', function (e) {
      const activeCaption = e.relatedTarget.querySelector('.carousel-caption');
      if (activeCaption) {
        // Reset animations
        const elements = activeCaption.querySelectorAll('.hero-title, .hero-subtitle, .hero-buttons');
        elements.forEach((el, index) => {
          el.style.animation = 'none';
          setTimeout(() => {
            el.style.animation = `fadeInUp 1s ease-out ${index * 0.2}s both`;
          }, 10);
        });
      }
    });
    
    // Control con teclado adicional
    document.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowLeft') {
        carousel.prev();
      } else if (e.key === 'ArrowRight') {
        carousel.next();
      }
    });
    
    // Control táctil mejorado (swipe)
    let touchStartX = 0;
    let touchEndX = 0;
    
    heroCarousel.addEventListener('touchstart', function(e) {
      touchStartX = e.changedTouches[0].screenX;
    });
    
    heroCarousel.addEventListener('touchend', function(e) {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    });
    
    function handleSwipe() {
      const swipeThreshold = 50;
      const diff = touchStartX - touchEndX;
      
      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
          // Swipe left - next
          carousel.next();
        } else {
          // Swipe right - prev
          carousel.prev();
        }
      }
    }
    
    // Indicador de progreso (opcional)
    createProgressBar();
    
    function createProgressBar() {
      const progressBar = document.createElement('div');
      progressBar.className = 'hero-progress-bar';
      progressBar.innerHTML = '<div class="hero-progress-fill"></div>';
      heroCarousel.appendChild(progressBar);
      
      // Estilos inline para la barra de progreso
      const style = document.createElement('style');
      style.textContent = `
        .hero-progress-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: rgba(255,255,255,0.2);
          z-index: 3;
        }
        .hero-progress-fill {
          height: 100%;
          background: var(--gold);
          width: 0%;
          transition: width 0.1s linear;
        }
      `;
      document.head.appendChild(style);
      
      let progress = 0;
      let interval;
      
      function startProgress() {
        progress = 0;
        clearInterval(interval);
        interval = setInterval(() => {
          progress += 2;
          document.querySelector('.hero-progress-fill').style.width = progress + '%';
          if (progress >= 100) {
            clearInterval(interval);
          }
        }, 100);
      }
      
      heroCarousel.addEventListener('slide.bs.carousel', startProgress);
      startProgress();
    }
    
    // Log para debug
    console.log('Hero Carousel inicializado correctamente');
  }
  
  // Efecto parallax suave en el hero (opcional)
  window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const heroItems = document.querySelectorAll('.hero-carousel .carousel-item.active img');
    
    heroItems.forEach(item => {
      item.style.transform = `translateY(${scrolled * 0.5}px) scale(1.1)`;
    });
  });
  
});