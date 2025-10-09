// ========================================
// SISTEMA DE ALMACENAMIENTO - LOCALSTORAGE
// ========================================

export const STORAGE_KEYS = {
  rooms: 'hotel_rooms',
  bookings: 'hotel_bookings',
  users: 'hotel_users',
  currentUser: 'hotel_current_user',
  admin: 'hotel_admin'
};

// ========================================
// INICIALIZACIÓN DE DATOS
// ========================================

export function initializeData() {
  // Inicializar habitaciones si no existen
  if (!getItem(STORAGE_KEYS.rooms)) {
    const defaultRooms = [
      {
        id: 1,
        nombre: 'Suite Deluxe',
        descripcion: 'Amplia suite con vista panorámica de la ciudad, jacuzzi privado y sala de estar.',
        camas: 2,
        personas: 4,
        precio: 320000,
        precioNoche: 320000, 
        servicios: ['WiFi', 'Jacuzzi', 'Minibar', 'TV 55"', 'Aire Acondicionado'],
        imagen: 'room2.webp', 
        disponible: true
      },
      {
        id: 2,
        nombre: 'Suite Ejecutiva',
        descripcion: 'Perfecta para viajeros de negocios, incluye escritorio amplio y zona de trabajo.',
        camas: 1,
        personas: 2,
        precio: 280000,
        precioNoche: 280000,
        servicios: ['WiFi', 'Minibar', 'Escritorio', 'TV 50"', 'Caja Fuerte'],
        imagen: 'room4.png', 
        disponible: true
      },
      {
        id: 3,
        nombre: 'Suite Presidencial',
        descripcion: 'Máximo lujo con dos habitaciones, jacuzzi, terraza privada y mayordomo.',
        camas: 3,
        personas: 6,
        precio: 580000,
        precioNoche: 580000,
        servicios: ['WiFi', 'Jacuzzi', 'Terraza', 'Mayordomo', 'Minibar Premium', 'TV 65"'],
        imagen: 'room3.webp', 
        disponible: true
      },
      {
        id: 4,
        nombre: 'Suite Romántica',
        descripcion: 'Escapada perfecta para parejas con cama king size y decoración íntima.',
        camas: 1,
        personas: 2,
        precio: 350000,
        precioNoche: 350000,
        servicios: ['WiFi', 'Jacuzzi', 'Velas Aromáticas', 'Champagne', 'Pétalos de Rosa'],
        imagen: 'room7.png', 
        disponible: true
      },
      {
        id: 5,
        nombre: 'Suite Familiar',
        descripcion: 'Espacio ideal para familias con dos habitaciones conectadas y área de juegos.',
        camas: 4,
        personas: 6,
        precio: 420000,
        precioNoche: 420000,
        servicios: ['WiFi', 'Minibar', 'Área de Juegos', 'TV 55"', 'Cocina'],
        imagen: 'room5.png', 
        disponible: true
      },
      {
        id: 6,
        nombre: 'Suite Junior',
        descripcion: 'Habitación confortable y moderna con todas las comodidades esenciales.',
        camas: 1,
        personas: 2,
        precio: 180000,
        precioNoche: 180000,
        servicios: ['WiFi', 'TV 42"', 'Aire Acondicionado'],
        imagen: 'room6.png',
        disponible: true
      }
    ];
    setItem(STORAGE_KEYS.rooms, defaultRooms);
  }

  // Inicializar usuario admin si no existe
  if (!getItem(STORAGE_KEYS.users)) {
    const defaultUsers = [
      {
        id: 1,
        identificacion: '12345678',
        nombre: 'Administrador',
        email: 'admin@rincondelcarmen.com',
        telefono: '3201234567',
        nacionalidad: 'Colombia',
        password: 'admin123',
        role: 'admin',
        fechaRegistro: new Date().toISOString()
      }
    ];
    setItem(STORAGE_KEYS.users, defaultUsers);
  }

  // Inicializar reservas si no existen
  if (!getItem(STORAGE_KEYS.bookings)) {
    setItem(STORAGE_KEYS.bookings, []);
  }
}

// ========================================
// FUNCIONES DE STORAGE
// ========================================

export function setItem(key, value) {
  try {
    const data = JSON.stringify(value);
    localStorage.setItem(key, data);
    return true;
  } catch (error) {
    console.error('Error al guardar en localStorage:', error);
    return false;
  }
}

export function getItem(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error al leer de localStorage:', error);
    return null;
  }
}

export function removeItem(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error al eliminar de localStorage:', error);
    return false;
  }
}

// ========================================
// GESTIÓN DE HABITACIONES
// ========================================

export function getRooms() {
  return getItem(STORAGE_KEYS.rooms) || [];
}

export function getRoomById(id) {
  const rooms = getRooms();
  return rooms.find(room => room.id === parseInt(id));
}

export function addRoom(roomData) {
  const rooms = getRooms();
  const newRoom = {
    id: Date.now(),
    ...roomData,
    disponible: true
  };
  rooms.push(newRoom);
  return setItem(STORAGE_KEYS.rooms, rooms) ? newRoom : null;
}

export function updateRoom(id, roomData) {
  const rooms = getRooms();
  const index = rooms.findIndex(room => room.id === parseInt(id));
  
  if (index === -1) return false;
  
  rooms[index] = { ...rooms[index], ...roomData };
  return setItem(STORAGE_KEYS.rooms, rooms);
}

export function deleteRoom(id) {
  const rooms = getRooms();
  const filteredRooms = rooms.filter(room => room.id !== parseInt(id));
  return setItem(STORAGE_KEYS.rooms, filteredRooms);
}

// ========================================
// GESTIÓN DE RESERVAS
// ========================================

export function getBookings() {
  return getItem(STORAGE_KEYS.bookings) || [];
}

export function getBookingById(id) {
  const bookings = getBookings();
  return bookings.find(booking => booking.id === parseInt(id));
}

export function getUserBookings(userId) {
  const bookings = getBookings();
  return bookings.filter(booking => booking.userId === parseInt(userId));
}

export function addBooking(bookingData) {
  const bookings = getBookings();
  const newBooking = {
    id: Date.now(),
    ...bookingData,
    fechaReserva: new Date().toISOString(),
    estado: 'confirmada'
  };
  bookings.push(newBooking);
  return setItem(STORAGE_KEYS.bookings, bookings) ? newBooking : null;
}

export function updateBooking(id, bookingData) {
  const bookings = getBookings();
  const index = bookings.findIndex(booking => booking.id === parseInt(id));
  
  if (index === -1) return false;
  
  bookings[index] = { ...bookings[index], ...bookingData };
  return setItem(STORAGE_KEYS.bookings, bookings);
}

export function cancelBooking(id) {
  const bookings = getBookings();
  const index = bookings.findIndex(booking => booking.id === parseInt(id));
  
  if (index === -1) return false;
  
  bookings[index].estado = 'cancelada';
  bookings[index].fechaCancelacion = new Date().toISOString();
  
  return setItem(STORAGE_KEYS.bookings, bookings);
}

export function deleteBooking(id) {
  const bookings = getBookings();
  const filteredBookings = bookings.filter(booking => booking.id !== parseInt(id));
  return setItem(STORAGE_KEYS.bookings, filteredBookings);
}

// ========================================
// VERIFICACIÓN DE DISPONIBILIDAD
// ========================================

export function checkAvailability(fechaInicio, fechaFin, personas = 1, roomIdToExclude = null) {
  const rooms = getRooms();
  const bookings = getBookings();
  
  const startDate = new Date(fechaInicio);
  const endDate = new Date(fechaFin);
  
  // Filtrar habitaciones disponibles
  const availableRooms = rooms.filter(room => {
    // Verificar capacidad
    if (room.personas < personas) return false;
    
    // Verificar si la habitación tiene reservas en conflicto
    const hasConflict = bookings.some(booking => {
      // Excluir la reserva actual si estamos editando
      if (roomIdToExclude && booking.id === roomIdToExclude) return false;
      
      // Solo verificar reservas confirmadas de esta habitación
      if (booking.roomId !== room.id || booking.estado !== 'confirmada') return false;
      
      const bookingStart = new Date(booking.fechaInicio);
      const bookingEnd = new Date(booking.fechaFin);
      
      // Verificar solapamiento de fechas
      return (startDate < bookingEnd && endDate > bookingStart);
    });
    
    return !hasConflict;
  });
  
  return availableRooms;
}

export function isRoomAvailable(roomId, fechaInicio, fechaFin, bookingIdToExclude = null) {
  const bookings = getBookings();
  const startDate = new Date(fechaInicio);
  const endDate = new Date(fechaFin);
  
  const hasConflict = bookings.some(booking => {
    if (bookingIdToExclude && booking.id === bookingIdToExclude) return false;
    if (booking.roomId !== parseInt(roomId) || booking.estado !== 'confirmada') return false;
    
    const bookingStart = new Date(booking.fechaInicio);
    const bookingEnd = new Date(booking.fechaFin);
    
    return (startDate < bookingEnd && endDate > bookingStart);
  });
  
  return !hasConflict;
}

// ========================================
// GESTIÓN DE USUARIOS
// ========================================

export function getUsers() {
  return getItem(STORAGE_KEYS.users) || [];
}

export function getUserById(id) {
  const users = getUsers();
  return users.find(user => user.id === parseInt(id));
}

export function getUserByEmail(email) {
  const users = getUsers();
  return users.find(user => user.email.toLowerCase() === email.toLowerCase());
}

export function addUser(userData) {
  const users = getUsers();
  
  // Verificar si el email ya existe
  if (getUserByEmail(userData.email)) {
    return { error: 'El email ya está registrado' };
  }
  
  // Verificar si la identificación ya existe
  if (users.find(u => u.identificacion === userData.identificacion)) {
    return { error: 'La identificación ya está registrada' };
  }
  
  const newUser = {
    id: Date.now(),
    ...userData,
    role: 'user',
    fechaRegistro: new Date().toISOString()
  };
  
  users.push(newUser);
  return setItem(STORAGE_KEYS.users, users) ? newUser : null;
}

export function updateUser(id, userData) {
  const users = getUsers();
  const index = users.findIndex(user => user.id === parseInt(id));
  
  if (index === -1) return false;
  
  users[index] = { ...users[index], ...userData };
  return setItem(STORAGE_KEYS.users, users);
}

export function deleteUser(id) {
  const users = getUsers();
  const filteredUsers = users.filter(user => user.id !== parseInt(id));
  return setItem(STORAGE_KEYS.users, filteredUsers);
}

// ========================================
// AUTENTICACIÓN (CORREGIDA)
// ========================================

export function login(email, password) {
  const users = getUsers();
  const user = users.find(u => 
    u.email.toLowerCase() === email.toLowerCase() && 
    u.password === password
  );
  
  if (user) {
    const userSession = {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      role: user.role
    };
    setItem(STORAGE_KEYS.currentUser, userSession);
    return { success: true, user: userSession };
  }
  
  return { success: false, error: 'Credenciales incorrectas' };
}

export function logout() {
  // Limpiar TODAS las claves relacionadas con la sesión
  removeItem(STORAGE_KEYS.currentUser);
  localStorage.removeItem('currentUser'); // clave legacy
  localStorage.removeItem('isLoggedIn'); // clave legacy
  localStorage.removeItem('hotel_current_user'); // por si acaso
  
  // Limpiar cualquier caché del sessionStorage también
  sessionStorage.clear();
  
  console.log('Sesión cerrada completamente'); // para debug
  
  return true;
}

export function getCurrentUser() {
  // Intentar obtener de la clave principal
  let user = getItem(STORAGE_KEYS.currentUser);
  
  // Si no existe, limpiar cualquier residuo y retornar null
  if (!user) {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
    return null;
  }
  
  // Validar que tenga los campos requeridos
  if (!user.id || !user.email) {
    removeItem(STORAGE_KEYS.currentUser);
    return null;
  }
  
  return user;
}

export function isAuthenticated() {
  const user = getCurrentUser();
  
  // Verificar que realmente existe y tiene datos válidos
  if (!user) return false;
  if (!user.id || !user.email) return false;
  
  return true;
}

export function isAdmin() {
  const user = getCurrentUser();
  return user && user.role === 'admin';
}

// ========================================
// UTILIDADES
// ========================================

export function calculateNights(fechaInicio, fechaFin) {
  const start = new Date(fechaInicio);
  const end = new Date(fechaFin);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function calculateTotal(roomId, fechaInicio, fechaFin) {
  const room = getRoomById(roomId);
  if (!room) return 0;
  
  const nights = calculateNights(fechaInicio, fechaFin);
  return room.precio * nights;
}

export function formatPrice(price) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(price);
}

export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// ========================================
// ESTADÍSTICAS (PARA ADMIN)
// ========================================

export function getStatistics() {
  const rooms = getRooms();
  const bookings = getBookings();
  const users = getUsers();
  
  const activeBookings = bookings.filter(b => b.estado === 'confirmada');
  const canceledBookings = bookings.filter(b => b.estado === 'cancelada');
  
  const totalRevenue = activeBookings.reduce((sum, b) => sum + b.total, 0);
  
  return {
    totalRooms: rooms.length,
    totalBookings: bookings.length,
    activeBookings: activeBookings.length,
    canceledBookings: canceledBookings.length,
    totalUsers: users.length,
    totalRevenue: totalRevenue,
    occupancyRate: rooms.length > 0 ? (activeBookings.length / rooms.length * 100).toFixed(1) : 0
  };
}

// Inicializar datos al cargar el módulo
initializeData();