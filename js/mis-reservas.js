// ========================================
// SCRIPT MIS RESERVAS
// ========================================

import {
  isAuthenticated,
  getCurrentUser,
  getUserBookings,
  getRoomById,
  cancelBooking,
  logout,
  formatPrice,
  formatDate
} from './storage.js';

// Verificar autenticación
if (!isAuthenticated()) {
  alert('Debes iniciar sesión para ver tus reservas');
  window.location.href = 'login.html';
}

const user = getCurrentUser();
const bookingsContainer = document.getElementById('bookingsContainer');
const detailsModal = new bootstrap.Modal(document.getElementById('detailsModal'));

// Actualizar información del perfil
document.getElementById('userName').textContent = user.nombre.split(' ')[0];
document.getElementById('profileName').textContent = user.nombre;
document.getElementById('profileEmail').textContent = user.email;

// Cerrar sesión
document.getElementById('logoutBtn').addEventListener('click', (e) => {
  e.preventDefault();
  if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
    logout();
    window.location.href = 'index.html';
  }
});

// Cargar reservas
let allBookings = [];
let currentFilter = 'all';

function loadBookings() {
  allBookings = getUserBookings(user.id);
  updateStats();
  renderBookings();
}

function updateStats() {
  const active = allBookings.filter(b => b.estado === 'confirmada').length;
  const totalSpent = allBookings
    .filter(b => b.estado === 'confirmada')
    .reduce((sum, b) => sum + b.total, 0);
  
  document.getElementById('totalBookings').textContent = allBookings.length;
  document.getElementById('activeBookings').textContent = active;
  document.getElementById('totalSpent').textContent = formatPrice(totalSpent);
}

function renderBookings() {
  let bookingsToShow = allBookings;
  
  if (currentFilter === 'active') {
    bookingsToShow = allBookings.filter(b => b.estado === 'confirmada');
  } else if (currentFilter === 'cancelled') {
    bookingsToShow = allBookings.filter(b => b.estado === 'cancelada');
  }
  
  if (bookingsToShow.length === 0) {
    bookingsContainer.innerHTML = `
      <div class="empty-bookings">
        <i class="bi bi-calendar-x"></i>
        <h3 class="text-muted">No tienes reservas${currentFilter !== 'all' ? ' ' + (currentFilter === 'active' ? 'activas' : 'canceladas') : ''}</h3>
        <p class="text-muted">¡Haz tu primera reserva y disfruta de nuestras suites de lujo!</p>
        <a href="reservas.html" class="btn btn-gold mt-3">
          <i class="bi bi-plus-circle"></i> Nueva Reserva
        </a>
      </div>
    `;
    return;
  }
  
  bookingsContainer.innerHTML = bookingsToShow.map(booking => createBookingCard(booking)).join('');
  
  // Agregar event listeners
  document.querySelectorAll('.btn-cancel-booking').forEach(btn => {
    btn.addEventListener('click', () => handleCancelBooking(parseInt(btn.dataset.bookingId)));
  });
  
  document.querySelectorAll('.btn-view-details').forEach(btn => {
    btn.addEventListener('click', () => showDetails(parseInt(btn.dataset.bookingId)));
  });
}

function createBookingCard(booking) {
  const room = getRoomById(booking.roomId);
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
            <img src="assets/img/rooms/${room.imagen}" alt="${room.nombre}" class="booking-image"
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
                <i class="bi bi-eye"></i> Ver Detalles
              </button>
              ${isActive && !isPast ? `
                <button class="btn btn-sm btn-danger btn-cancel-booking" data-booking-id="${booking.id}">
                  <i class="bi bi-x-circle"></i> Cancelar Reserva
                </button>
              ` : ''}
              ${isPast && isActive ? '<span class="badge bg-secondary">Completada</span>' : ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function handleCancelBooking(bookingId) {
  const booking = allBookings.find(b => b.id === bookingId);
  const room = getRoomById(booking.roomId);
  
  if (confirm(`¿Estás seguro que deseas cancelar tu reserva en ${room.nombre}?`)) {
    if (cancelBooking(bookingId)) {
      showAlert('Reserva cancelada exitosamente', 'success');
      loadBookings();
    } else {
      showAlert('Error al cancelar la reserva', 'danger');
    }
  }
}

function showDetails(bookingId) {
  const booking = allBookings.find(b => b.id === bookingId);
  const room = getRoomById(booking.roomId);
  
  const fechaInicio = new Date(booking.fechaInicio);
  const fechaFin = new Date(booking.fechaFin);
  const nights = Math.ceil((fechaFin - fechaInicio) / (1000 * 60 * 60 * 24));
  
  document.getElementById('detailsBody').innerHTML = `
    <div class="row">
      <div class="col-md-6">
        <img src="assets/img/rooms/${room.imagen}" class="img-fluid rounded mb-3" alt="${room.nombre}"
             onerror="this.src='https://picsum.photos/500/400?random=${booking.id}'">
      </div>
      <div class="col-md-6">
        <h4 class="mb-3">${room.nombre}</h4>
        <p class="text-muted">${room.descripcion}</p>
        
        <h6 class="mt-4 mb-3 text-gold">Información de la Reserva</h6>
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
          ${booking.fechaCancelacion ? `
            <li class="mb-2">
              <i class="bi bi-x-circle text-danger"></i> 
              <strong>Cancelada:</strong> ${formatDate(booking.fechaCancelacion)}
            </li>
          ` : ''}
        </ul>
        
        <h6 class="mt-4 mb-3 text-gold">Servicios Incluidos</h6>
        <div class="mb-3">
          ${room.servicios.map(s => `
            <span class="service-badge">
              <i class="bi bi-check2"></i> ${s}
            </span>
          `).join('')}
        </div>
        
        <div class="alert alert-info">
          <h6 class="alert-heading">Detalles del Costo</h6>
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
      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
      ${booking.estado === 'confirmada' && new Date(booking.fechaFin) > new Date() ? `
        <button type="button" class="btn btn-danger" onclick="cancelFromModal(${booking.id})">
          <i class="bi bi-x-circle"></i> Cancelar Reserva
        </button>
      ` : ''}
    </div>
  `;
  
  detailsModal.show();
}

// Cancelar desde modal
window.cancelFromModal = function(bookingId) {
  detailsModal.hide();
  setTimeout(() => handleCancelBooking(bookingId), 300);
};

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

// Filtros
document.getElementById('filterAll').addEventListener('change', () => {
  currentFilter = 'all';
  renderBookings();
});

document.getElementById('filterActive').addEventListener('change', () => {
  currentFilter = 'active';
  renderBookings();
});

document.getElementById('filterCancelled').addEventListener('change', () => {
  currentFilter = 'cancelled';
  renderBookings();
});

// Cargar reservas inicialmente
loadBookings();
