// ========================================
// SCRIPT PANEL ADMINISTRATIVO COMPLETO
// ========================================

import {
  isAdmin,
  logout,
  getCurrentUser,
  getStatistics,
  getRooms,
  getBookings,
  getUsers,
  getRoomById,
  getUserById,
  addRoom,
  updateRoom,
  deleteRoom,
  cancelBooking as cancelBookingStorage,
  formatPrice,
  formatDate
} from './storage.js';

// ========================================
// VERIFICACIÓN DE ACCESO
// ========================================
if (!isAdmin()) {
  alert('Acceso denegado. Solo administradores.');
  window.location.href = 'index.html';
}

const user = getCurrentUser();
document.getElementById('adminName').textContent = user.nombre;

// ========================================
// VARIABLES GLOBALES
// ========================================
let currentRoomId = null;
const roomModal = new bootstrap.Modal(document.getElementById('roomModal'));

// ========================================
// SIDEBAR TOGGLE MÓVIL
// ========================================
document.getElementById('sidebarToggle').addEventListener('click', () => {
  document.getElementById('adminSidebar').classList.toggle('show');
});

// ========================================
// NAVEGACIÓN ENTRE SECCIONES
// ========================================
document.querySelectorAll('.menu-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const section = link.dataset.section;
    
    // Actualizar menú activo
    document.querySelectorAll('.menu-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    
    // Mostrar sección
    document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
    document.getElementById(`${section}-section`).style.display = 'block';
    
    // Cargar datos
    if (section === 'rooms') loadRooms();
    else if (section === 'bookings') loadBookings();
    
    // Ocultar sidebar en móvil
    document.getElementById('adminSidebar').classList.remove('show');
  });
});

// ========================================
// CERRAR SESIÓN
// ========================================
document.getElementById('logoutBtn').addEventListener('click', (e) => {
  e.preventDefault();
  logout();
  window.location.href = 'login.html';
});

// ========================================
// CARGAR HABITACIONES INICIALMENTE
// ========================================
loadRooms();

// ========================================
// FUNCIÓN: CARGAR HABITACIONES
// ========================================
function loadRooms() {
  const rooms = getRooms();
  const tbody = document.querySelector('#roomsTable tbody');
  tbody.innerHTML = '';

  if (rooms.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No hay habitaciones</td></tr>';
    return;
  }

  rooms.forEach(room => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${room.id}</td>
      <td>${room.nombre}</td>
      <td>${room.personas}</td>
      <td>${room.camas}</td>
      <td>${formatPrice(room.precioNoche || room.precio)}</td>
      <td>${room.servicios.slice(0, 3).join(', ')}${room.servicios.length > 3 ? '...' : ''}</td>
      <td class="table-actions">
        <button class="btn btn-sm btn-outline-primary" onclick="window.openRoomModal(${room.id})">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger" onclick="window.deleteRoomById(${room.id})">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ========================================
// FUNCIÓN: CARGAR RESERVAS
// ========================================
function loadBookings() {
  filterBookings();
  
  // Configurar event listeners para filtros
  document.getElementById('allBookings').addEventListener('change', filterBookings);
  document.getElementById('confirmedBookings').addEventListener('change', filterBookings);
  document.getElementById('cancelledBookings').addEventListener('change', filterBookings);
}

// ========================================
// FUNCIÓN: FILTRAR RESERVAS
// ========================================
function filterBookings() {
  const all = document.getElementById('allBookings').checked;
  const confirmed = document.getElementById('confirmedBookings').checked;
  const cancelled = document.getElementById('cancelledBookings').checked;

  const bookings = getBookings();
  const tbody = document.querySelector('#bookingsTable tbody');
  tbody.innerHTML = '';

  let filteredBookings = bookings;
  if (confirmed) {
    filteredBookings = bookings.filter(b => b.estado === 'confirmada');
  } else if (cancelled) {
    filteredBookings = bookings.filter(b => b.estado === 'cancelada');
  }

  if (filteredBookings.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted">No hay reservas</td></tr>';
    return;
  }

  filteredBookings.forEach(booking => {
    const room = getRoomById(booking.roomId || booking.habitacionId);
    const user = getUserById(booking.userId);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${booking.id}</td>
      <td>${room ? room.nombre : 'N/A'}</td>
      <td>${user ? user.nombre : (booking.nombreCliente || 'N/A')}</td>
      <td>${formatDate(booking.fechaInicio || booking.checkIn)}</td>
      <td>${formatDate(booking.fechaFin || booking.checkOut)}</td>
      <td>${booking.personas}</td>
      <td>${formatPrice(booking.total)}</td>
      <td>
        <span class="badge bg-${booking.estado === 'confirmada' ? 'success' : 'danger'}">
          ${booking.estado.charAt(0).toUpperCase() + booking.estado.slice(1)}
        </span>
      </td>
      <td class="table-actions">
        <button class="btn btn-sm btn-outline-primary" onclick="window.viewInvoice(${booking.id})" title="Ver Factura">
          <i class="bi bi-receipt"></i>
        </button>
        ${booking.estado === 'confirmada' ? `
          <button class="btn btn-sm btn-outline-danger" onclick="window.cancelBooking(${booking.id})" title="Cancelar Reserva">
            <i class="bi bi-x-circle"></i>
          </button>
        ` : ''}
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ========================================
// FUNCIÓN: ABRIR MODAL DE HABITACIÓN
// ========================================
window.openRoomModal = function(id = null) {
  currentRoomId = id;
  document.getElementById('roomForm').reset();
  document.getElementById('servicesContainer').innerHTML = `
    <div class="input-group mb-2">
      <input type="text" class="form-control service-input" placeholder="Ej: WiFi">
      <button type="button" class="btn btn-outline-secondary" onclick="window.addServiceInput()">
        <i class="bi bi-plus"></i>
      </button>
    </div>
  `;

  if (id) {
    const room = getRoomById(id);
    if (room) {
      document.getElementById('roomModalTitle').innerHTML = `<i class="bi bi-pencil"></i> Editar Habitación`;
      document.getElementById('roomId').value = room.id;
      document.getElementById('roomName').value = room.nombre;
      document.getElementById('roomImage').value = room.imagen;
      document.getElementById('roomDescription').value = room.descripcion;
      document.getElementById('roomBeds').value = room.camas;
      document.getElementById('roomPersons').value = room.personas;
      document.getElementById('roomPrice').value = room.precioNoche || room.precio;

      const servicesContainer = document.getElementById('servicesContainer');
      servicesContainer.innerHTML = '';
      room.servicios.forEach((servicio) => {
        const div = document.createElement('div');
        div.className = 'input-group mb-2';
        div.innerHTML = `
          <input type="text" class="form-control service-input" value="${servicio}" placeholder="Ej: WiFi">
          <button type="button" class="btn btn-outline-danger" onclick="window.removeServiceInput(this)">
            <i class="bi bi-dash"></i>
          </button>
        `;
        servicesContainer.appendChild(div);
      });

      const addDiv = document.createElement('div');
      addDiv.className = 'input-group mb-2';
      addDiv.innerHTML = `
        <input type="text" class="form-control service-input" placeholder="Ej: WiFi">
        <button type="button" class="btn btn-outline-secondary" onclick="window.addServiceInput()">
          <i class="bi bi-plus"></i>
        </button>
      `;
      servicesContainer.appendChild(addDiv);
    }
  } else {
    document.getElementById('roomModalTitle').innerHTML = `<i class="bi bi-door-closed"></i> Nueva Habitación`;
    document.getElementById('roomId').value = '';
  }
  roomModal.show();
};

// ========================================
// FUNCIÓN: AGREGAR INPUT DE SERVICIO
// ========================================
window.addServiceInput = function() {
  const servicesContainer = document.getElementById('servicesContainer');
  const div = document.createElement('div');
  div.className = 'input-group mb-2';
  div.innerHTML = `
    <input type="text" class="form-control service-input" placeholder="Ej: WiFi">
    <button type="button" class="btn btn-outline-danger" onclick="window.removeServiceInput(this)">
      <i class="bi bi-dash"></i>
    </button>
  `;
  servicesContainer.appendChild(div);
};

// ========================================
// FUNCIÓN: ELIMINAR INPUT DE SERVICIO
// ========================================
window.removeServiceInput = function(button) {
  button.parentElement.remove();
};

// ========================================
// EVENTO: SUBMIT FORMULARIO HABITACIÓN
// ========================================
document.getElementById('roomForm').addEventListener('submit', (e) => {
  e.preventDefault();
  
  const id = document.getElementById('roomId').value;
  const nombre = document.getElementById('roomName').value.trim();
  const imagen = document.getElementById('roomImage').value.trim();
  const descripcion = document.getElementById('roomDescription').value.trim();
  const camas = parseInt(document.getElementById('roomBeds').value);
  const personas = parseInt(document.getElementById('roomPersons').value);
  const precioNoche = parseFloat(document.getElementById('roomPrice').value);
  
  const servicios = Array.from(document.querySelectorAll('.service-input'))
    .map(input => input.value.trim())
    .filter(val => val !== '');
  
  if (!nombre || !imagen || !descripcion || isNaN(camas) || isNaN(personas) || isNaN(precioNoche)) {
    alert('Por favor, completa todos los campos obligatorios.');
    return;
  }
  
  const roomData = { 
    nombre, 
    imagen, 
    descripcion, 
    camas, 
    personas, 
    precioNoche, 
    precio: precioNoche,
    servicios 
  };
  
  if (id) {
    updateRoom(parseInt(id), roomData);
    alert('Habitación actualizada correctamente.');
  } else {
    addRoom(roomData);
    alert('Nueva habitación añadida correctamente.');
  }
  
  roomModal.hide();
  loadRooms();
});

// ========================================
// FUNCIÓN: ELIMINAR HABITACIÓN
// ========================================
window.deleteRoomById = function(id) {
  if (confirm('¿Estás seguro de eliminar esta habitación? Esta acción no se puede deshacer.')) {
    deleteRoom(id);
    alert('Habitación eliminada correctamente.');
    loadRooms();
  }
};

// ========================================
// FUNCIÓN: CANCELAR RESERVA
// ========================================
window.cancelBooking = function(id) {
  if (confirm('¿Estás seguro de cancelar esta reserva?')) {
    cancelBookingStorage(id);
    alert('Reserva cancelada correctamente.');
    loadBookings();
  }
};

// ========================================
// FUNCIÓN: VER FACTURA
// ========================================
window.viewInvoice = function(id) {
  const booking = getBookings().find(b => b.id === id);
  if (!booking) {
    alert('Reserva no encontrada');
    return;
  }

  const room = getRoomById(booking.roomId);
  const user = getUserById(booking.userId);
  
  if (!room || !user) {
    alert('Error al cargar los datos de la factura');
    return;
  }

  const nights = Math.ceil((new Date(booking.fechaFin) - new Date(booking.fechaInicio)) / (1000 * 60 * 60 * 24));
  const total = booking.total;

  const invoiceHTML = `
    <div class="invoice-container" style="max-width: 800px; margin: 0 auto; font-family: Arial, sans-serif;">
      <!-- HEADER -->
      <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0;">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div>
            <h2 style="margin: 0; color: #d4af37; font-size: 28px;">
              <i class="bi bi-building"></i> EL RINCÓN DEL CARMEN
            </h2>
            <p style="margin: 5px 0 0 0; font-size: 14px;">Hotel Boutique de Lujo</p>
          </div>
          <div style="text-align: right;">
            <h3 style="margin: 0; color: #d4af37; font-size: 24px;">FACTURA</h3>
            <p style="margin: 5px 0 0 0; font-size: 14px;">N° ${String(booking.id).padStart(8, '0')}</p>
          </div>
        </div>
      </div>

      <!-- DATOS DEL CLIENTE -->
      <div style="background: #f8f9fa; padding: 20px; border-left: 4px solid #d4af37; border-right: 4px solid #d4af37;">
        <h4 style="margin: 0 0 10px 0; color: #1a1a1a; font-size: 16px;">
          <i class="bi bi-person-circle" style="color: #d4af37;"></i> Datos del Cliente
        </h4>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
          <p style="margin: 3px 0; font-size: 13px;"><strong>Nombre:</strong> ${user.nombre}</p>
          <p style="margin: 3px 0; font-size: 13px;"><strong>Identificación:</strong> ${user.identificacion || 'N/A'}</p>
          <p style="margin: 3px 0; font-size: 13px;"><strong>Email:</strong> ${user.email}</p>
          <p style="margin: 3px 0; font-size: 13px;"><strong>Teléfono:</strong> ${user.telefono || 'N/A'}</p>
          <p style="margin: 3px 0; font-size: 13px;"><strong>Nacionalidad:</strong> ${user.nacionalidad || 'N/A'}</p>
        </div>
      </div>

      <!-- DATOS DE LA RESERVA -->
      <div style="background: white; padding: 20px; border-left: 4px solid #d4af37; border-right: 4px solid #d4af37;">
        <h4 style="margin: 0 0 15px 0; color: #1a1a1a; font-size: 16px; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">
          <i class="bi bi-calendar-check" style="color: #d4af37;"></i> Información de la Reserva
        </h4>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
          <div>
            <p style="margin: 5px 0; font-size: 13px;"><strong>Fecha de Emisión:</strong></p>
            <p style="margin: 0; font-size: 13px; color: #555;">${formatDate(booking.fechaReserva)}</p>
          </div>
          <div>
            <p style="margin: 5px 0; font-size: 13px;"><strong>ID Reserva:</strong></p>
            <p style="margin: 0; font-size: 13px; color: #555;">#${booking.id}</p>
          </div>
          <div>
            <p style="margin: 5px 0; font-size: 13px;"><strong>Check-in:</strong></p>
            <p style="margin: 0; font-size: 13px; color: #555;">${formatDate(booking.fechaInicio)}</p>
          </div>
          <div>
            <p style="margin: 5px 0; font-size: 13px;"><strong>Check-out:</strong></p>
            <p style="margin: 0; font-size: 13px; color: #555;">${formatDate(booking.fechaFin)}</p>
          </div>
          <div>
            <p style="margin: 5px 0; font-size: 13px;"><strong>N° de Noches:</strong></p>
            <p style="margin: 0; font-size: 13px; color: #555;">${nights}</p>
          </div>
          <div>
            <p style="margin: 5px 0; font-size: 13px;"><strong>N° de Huéspedes:</strong></p>
            <p style="margin: 0; font-size: 13px; color: #555;">${booking.personas}</p>
          </div>
        </div>
      </div>

      <!-- DETALLE DE SERVICIOS -->
      <div style="background: white; padding: 20px; border-left: 4px solid #d4af37; border-right: 4px solid #d4af37;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #1a1a1a; color: white;">
              <th style="padding: 12px; text-align: left; font-size: 13px; border: 1px solid #ddd;">Descripción</th>
              <th style="padding: 12px; text-align: center; font-size: 13px; border: 1px solid #ddd; width: 80px;">Cant.</th>
              <th style="padding: 12px; text-align: right; font-size: 13px; border: 1px solid #ddd; width: 120px;">Precio Unit.</th>
              <th style="padding: 12px; text-align: right; font-size: 13px; border: 1px solid #ddd; width: 120px;">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 12px; border: 1px solid #ddd; font-size: 13px;">
                <strong>${room.nombre}</strong><br>
                <small style="color: #666;">${room.descripcion.substring(0, 80)}...</small><br>
                <small style="color: #666;">Servicios incluidos: ${room.servicios.slice(0, 3).join(', ')}</small>
              </td>
              <td style="padding: 12px; text-align: center; border: 1px solid #ddd; font-size: 13px;">${nights}</td>
              <td style="padding: 12px; text-align: right; border: 1px solid #ddd; font-size: 13px;">${formatPrice(room.precio)}</td>
              <td style="padding: 12px; text-align: right; border: 1px solid #ddd; font-size: 13px;"><strong>${formatPrice(total)}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- TOTALES -->
      <div style="background: white; padding: 20px; border-left: 4px solid #d4af37; border-right: 4px solid #d4af37; border-bottom: 4px solid #d4af37; border-radius: 0 0 10px 10px;">
        <table style="width: 100%; max-width: 300px; margin-left: auto;">
          <tr style="border-top: 2px solid #d4af37;">
            <td style="padding: 12px 0; font-size: 18px; text-align: right; color: #d4af37;"><strong>TOTAL A PAGAR:</strong></td>
            <td style="padding: 12px 0; font-size: 18px; text-align: right; color: #d4af37; font-weight: bold; width: 120px;">${formatPrice(total)}</td>
          </tr>
        </table>
      </div>
    </div>
  `;

  // Mostrar en modal
  const modalElement = document.getElementById('invoiceModal');
  if (!modalElement) {
    // Crear modal si no existe
    const modal = document.createElement('div');
    modal.innerHTML = `
      <div class="modal fade" id="invoiceModal" tabindex="-1">
        <div class="modal-dialog modal-xl">
          <div class="modal-content">
            <div class="modal-header bg-dark text-white">
              <h5 class="modal-title">
                <i class="bi bi-receipt"></i> Factura de Reserva
              </h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body" id="invoiceBody">
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                <i class="bi bi-x-circle"></i> Cerrar
              </button>
              <button type="button" class="btn btn-gold" onclick="window.printInvoice()">
                <i class="bi bi-printer"></i> Imprimir Factura
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal.firstElementChild);
  }

  document.getElementById('invoiceBody').innerHTML = invoiceHTML;
  const invoiceModal = new bootstrap.Modal(document.getElementById('invoiceModal'));
  invoiceModal.show();
};

// ========================================
// FUNCIÓN: IMPRIMIR FACTURA
// ========================================
window.printInvoice = function() {
  const invoiceContent = document.getElementById('invoiceBody').innerHTML;
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Factura - El Rincón del Carmen</title>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 20px;
          background: white;
        }
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      ${invoiceContent}
      <div class="no-print" style="text-align: center; margin-top: 20px;">
        <button onclick="window.print()" style="padding: 10px 20px; background: #d4af37; color: white; border: none; border-radius: 5px; cursor: pointer;">
          Imprimir
        </button>
        <button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
          Cerrar
        </button>
      </div>
    </body>
    </html>
  `);
  printWindow.document.close();
};

// ========================================
// FUNCIÓN: VER USUARIO
// ========================================
window.viewUser = function(id) {
  const user = getUserById(id);
  if (user) {
    const bookingsCount = getBookings().filter(b => b.userId === user.id).length;
    const activeBookingsCount = getBookings().filter(b => b.userId === user.id && b.estado === 'confirmada').length;
    
    alert(`


ID: ${user.id}
Nombre: ${user.nombre}
Email: ${user.email}
Teléfono: ${user.telefono || 'N/A'}
Identificación: ${user.identificacion || 'N/A'}
Nacionalidad: ${user.nacionalidad || 'N/A'}
Rol: ${user.role === 'admin' ? 'Administrador' : 'Usuario'}
Fecha de Registro: ${formatDate(user.fechaRegistro)}
Total de Reservas: ${bookingsCount}
Reservas Activas: ${activeBookingsCount}
    `);
  } else {
    alert('Usuario no encontrado.');
  }
};

