document.getElementById('regisForm').addEventListener('submit', (e) => {
  e.preventDefault();
  Date.prototype.getMinutes()
  const id = document.getElementById('id').value;
  const nombre = document.getElementById('nombre').value.trim();
  const imagen = document.getElementById('email').value.trim();
  const descripcion = document.getElementById('telefono').value.trim();
  const camas = parseInt(document.getElementById('horallegada').value);
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

