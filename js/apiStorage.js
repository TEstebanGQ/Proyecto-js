// js/apiStorage.js
export const storageKeys = {
  rooms: "hotel_rooms",
  bookings: "hotel_bookings",
};

// Datos iniciales
if (!localStorage.getItem(storageKeys.rooms)) {
  localStorage.setItem(storageKeys.rooms, JSON.stringify([
    { id: 1, nombre: "Suite Deluxe", camas: 2, personas: 4, precio: 320000, servicios: ["WiFi", "Jacuzzi"], imagen: "suite1.jpg" },
    { id: 2, nombre: "Suite Ejecutiva", camas: 1, personas: 2, precio: 280000, servicios: ["WiFi", "Minibar"], imagen: "suite2.jpg" }
  ]));
}

export function getRooms() {
  return JSON.parse(localStorage.getItem(storageKeys.rooms)) || [];
}

export function getBookings() {
  return JSON.parse(localStorage.getItem(storageKeys.bookings)) || [];
}

export function saveBooking(booking) {
  const bookings = getBookings();
  bookings.push(booking);
  localStorage.setItem(storageKeys.bookings, JSON.stringify(bookings));
}

export function checkAvailability(inicio, fin) {
  const rooms = getRooms();
  const bookings = getBookings();
  return rooms.filter(room => {
    return !bookings.some(b => b.roomId === room.id && (
      (inicio >= b.inicio && inicio <= b.fin) || (fin >= b.inicio && fin <= b.fin)
    ));
  });
}
