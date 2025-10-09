// ========================================
// SCRIPT MIS RESERVAS - SOLO VISUALIZACIÓN
// ========================================

import {
  isAuthenticated,
  getCurrentUser,
  getUserBookings,
  getRoomById,
  formatPrice,
  formatDate
} from './storage.js';

// ========================================
// VERIFICACIÓN DE AUTENTICACIÓN
// ========================================
if (!isAuthenticated()) {
  alert('Debes iniciar sesión para ver tus reservas');
  window.location.href = 'login.html';
}

const user = getCurrentUser();
if (!user) {
  alert('Error al cargar los datos del usuario');
  window.location.href = 'login.html';
}

// ========================================
// ELEMENTOS DEL DOM
// ========================================
const bookingsContainer = document.getElementById('bookingsContainer');
const detailsModalEl = document.getElementById('detailsModal');
const detailsModal = detailsModalEl ? new bootstrap.Modal(detailsModalEl) : null;

// Actualizar información del perfil
const userNameEl = document.getElementById('userName');
const profileNameEl = document.getElementById('profileName');
const profileEmailEl = document.getElementById('profileEmail');

if (userNameEl) userNameEl.textContent = user.nombre.split(' ')[0];
if (profileNameEl) profileNameEl.textContent = user.nombre;
if (profileEmailEl) profileEmailEl.textContent = user.email;

// ========================================
// CERRAR SESIÓN ELIMINADO DE AQUÍ
// El navbar-user.js ya maneja el cerrar sesión
// ========================================

// ========================================
// CARGAR RESERVAS
// ========================================
let allBookings = [];

function loadBookings() {
  try {
    allBookings = getUserBookings(user.id);
    console.log('Reservas cargadas:', allBookings);
    updateStats();
    renderBookings();
  } catch (error) {
    console.error('Error al cargar reservas:', error);
    showAlert('Error al cargar las reservas', 'danger');
  }
}

function updateStats() {
  const active = allBookings.filter(b => b.estado === 'confirmada').length;
  const totalSpent = allBookings
    .filter(b => b.estado === 'confirmada')
    .reduce((sum, b) => sum + b.total, 0);
  
  const totalBookingsEl = document.getElementById('totalBookings');
  const activeBookingsEl = document.getElementById('activeBookings');
  const totalSpentEl = document.getElementById('totalSpent');
  
  if (totalBookingsEl) totalBookingsEl.textContent = allBookings.length;
  if (activeBookingsEl) activeBookingsEl.textContent = active;
  if (totalSpentEl) totalSpentEl.textContent = formatPrice(totalSpent);
}

function renderBookings() {
  if (allBookings.length === 0) {
    bookingsContainer.innerHTML = `
      <div class="empty-bookings">
        <i class="bi bi-calendar-x"></i>
        <h3 class="text-muted">No tienes reservas</h3>
        <p class="text-muted">¡Haz tu primera reserva y disfruta de nuestras suites de lujo!</p>
        <a href="reservas.html" class="btn btn-gold mt-3">
          <i class="bi bi-plus-circle"></i> Nueva Reserva
        </a>
      </div>
    `;
    return;
  }
  
  bookingsContainer.innerHTML = allBookings.map(booking => createBookingCard(booking)).join('');
  
  // Agregar event listeners solo para ver detalles
  document.querySelectorAll('.btn-view-details').forEach(btn => {
    btn.addEventListener('click', () => showDetails(parseInt(btn.dataset.bookingId)));
  });
}

function createBookingCard(booking) {
  const room = getRoomById(booking.roomId);
  
  // Si no se encuentra la habitación, usar datos por defecto
  if (!room) {
    console.warn('Habitación no encontrada:', booking.roomId);
    return `
      <div class="booking-card">
        <div class="booking-header bg-danger">
          <p class="mb-0 text-white">Error: Habitación no encontrada (ID: ${booking.roomId})</p>
        </div>
      </div>
    `;
  }
  
  const isActive = booking.estado === 'confirmada';
  const isPast = new Date(booking.fechaFin) < new Date();
  
  return `
    <div class="booking-card">
      <div class="booking-header">
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h5 class="mb-1">${room.nombre}</h5>
            <small>Reserva #${booking.id}</small>
          </div>
          <span class="booking-status status-${booking.estado}">
            <i class="bi bi-${booking.estado === 'confirmada' ? 'check-circle' : 'x-circle'}"></i>
            ${booking.estado === 'confirmada' ? 'Confirmada' : 'Cancelada'}
          </span>
        </div>
      </div>
      
      <div class="booking-body">
        <div class="row">
          <div class="col-md-4 mb-3 mb-md-0">
            <img src="assets/img/rooms/${room.imagen}" 
                 alt="${room.nombre}" 
                 class="booking-image"
                 onerror="this.src='https://picsum.photos/400/300?random=${booking.id}'">
          </div>
          
          <div class="col-md-8">
            <div class="info-row">
              <span class="text-muted">
                <i class="bi bi-calendar-check text-gold"></i> Check-in
              </span>
              <strong>${formatDate(booking.fechaInicio)}</strong>
            </div>
            
            <div class="info-row">
              <span class="text-muted">
                <i class="bi bi-calendar-x text-gold"></i> Check-out
              </span>
              <strong>${formatDate(booking.fechaFin)}</strong>
            </div>
            
            <div class="info-row">
              <span class="text-muted">
                <i class="bi bi-people text-gold"></i> Personas
              </span>
              <strong>${booking.personas}</strong>
            </div>
            
            <div class="info-row">
              <span class="text-muted">
                <i class="bi bi-currency-dollar text-gold"></i> Total
              </span>
              <strong class="text-gold">${formatPrice(booking.total)}</strong>
            </div>
            
            <div class="mt-3 d-flex gap-2 flex-wrap">
              <button class="btn btn-sm btn-outline-dark btn-view-details" data-booking-id="${booking.id}">
                <i class="bi bi-eye"></i> Ver Detalles Completos
              </button>
              ${isPast && isActive ? '<span class="badge bg-success"><i class="bi bi-check-circle"></i> Completada</span>' : ''}
              ${!isPast && isActive ? '<span class="badge bg-info"><i class="bi bi-clock"></i> Próxima</span>' : ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ========================================
// MOSTRAR DETALLES (SOLO LECTURA)
// ========================================
function showDetails(bookingId) {
  const booking = allBookings.find(b => b.id === bookingId);
  if (!booking) {
    showAlert('Reserva no encontrada', 'danger');
    return;
  }
  
  const room = getRoomById(booking.roomId);
  if (!room) {
    showAlert('Información de la habitación no disponible', 'danger');
    return;
  }
  
  const fechaInicio = new Date(booking.fechaInicio);
  const fechaFin = new Date(booking.fechaFin);
  const nights = Math.ceil((fechaFin - fechaInicio) / (1000 * 60 * 60 * 24));
  
  document.getElementById('detailsBody').innerHTML = `
    <div class="row">
      <div class="col-md-6">
        <img src="assets/img/rooms/${room.imagen}" 
             class="img-fluid rounded mb-3" 
             alt="${room.nombre}"
             onerror="this.src='https://picsum.photos/500/400?random=${booking.id}'">
      </div>
      <div class="col-md-6">
        <h4 class="mb-3">${room.nombre}</h4>
        <p class="text-muted">${room.descripcion}</p>
        
        <h6 class="mt-4 mb-3 text-gold">
          <i class="bi bi-info-circle"></i> Información de la Reserva
        </h6>
        <ul class="list-unstyled">
          <li class="mb-2">
            <i class="bi bi-hash text-gold"></i> 
            <strong>ID:</strong> ${booking.id}
          </li>
          <li class="mb-2">
            <i class="bi bi-calendar-check text-gold"></i> 
            <strong>Check-in:</strong> ${formatDate(booking.fechaInicio)}
          </li>
          <li class="mb-2">
            <i class="bi bi-calendar-x text-gold"></i> 
            <strong>Check-out:</strong> ${formatDate(booking.fechaFin)}
          </li>
          <li class="mb-2">
            <i class="bi bi-moon-stars text-gold"></i> 
            <strong>Noches:</strong> ${nights}
          </li>
          <li class="mb-2">
            <i class="bi bi-people text-gold"></i> 
            <strong>Personas:</strong> ${booking.personas}
          </li>
          <li class="mb-2">
            <i class="bi bi-clock text-gold"></i> 
            <strong>Fecha de reserva:</strong> ${formatDate(booking.fechaReserva)}
          </li>
          <li class="mb-2">
            <i class="bi bi-info-circle text-gold"></i> 
            <strong>Estado:</strong> 
            <span class="booking-status status-${booking.estado}">
              ${booking.estado === 'confirmada' ? 'Confirmada' : 'Cancelada'}
            </span>
          </li>
        </ul>
        
        <h6 class="mt-4 mb-3 text-gold">
          <i class="bi bi-star"></i> Servicios Incluidos
        </h6>
        <div class="mb-3">
          ${room.servicios.map(s => `
            <span class="service-badge">
              <i class="bi bi-check2"></i> ${s}
            </span>
          `).join('')}
        </div>
        
        <div class="alert alert-info">
          <h6 class="alert-heading">
            <i class="bi bi-currency-dollar"></i> Detalles del Costo
          </h6>
          <div class="d-flex justify-content-between mb-1">
            <span>Precio por noche:</span>
            <strong>${formatPrice(room.precio)}</strong>
          </div>
          <div class="d-flex justify-content-between mb-1">
            <span>Noches (${nights}):</span>
            <strong>${formatPrice(room.precio * nights)}</strong>
          </div>
          <hr>
          <div class="d-flex justify-content-between">
            <span><strong>Total Pagado:</strong></span>
            <h5 class="text-gold mb-0">${formatPrice(booking.total)}</h5>
          </div>
        </div>
      </div>
    </div>
    
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
        <i class="bi bi-x-circle"></i> Cerrar
      </button>
    </div>
  `;
  
  if (detailsModal) {
    detailsModal.show();
  }
}

// ========================================
// MOSTRAR ALERTAS
// ========================================
function showAlert(message, type) {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
  alertDiv.style.zIndex = '9999';
  alertDiv.innerHTML = `
    <i class="bi bi-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i>
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  document.body.appendChild(alertDiv);
  
  setTimeout(() => alertDiv.remove(), 3000);
}

// ========================================
// FILTROS DE RESERVAS (OPCIONALES - NO IMPLEMENTADOS)
// ========================================
const filterAll = document.getElementById('filterAll');
const filterActive = document.getElementById('filterActive');
const filterPast = document.getElementById('filterPast');

if (filterAll) {
  filterAll.addEventListener('change', () => {
    currentFilter = 'all';
    renderBookings();
  });
}

if (filterActive) {
  filterActive.addEventListener('change', () => {
    currentFilter = 'active';
    renderBookings();
  });
}

if (filterPast) {
  filterPast.addEventListener('change', () => {
    currentFilter = 'past';
    renderBookings();
  });
}

// ========================================
// CARGAR RESERVAS AL INICIAR
// ========================================
loadBookings();