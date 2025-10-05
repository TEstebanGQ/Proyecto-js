import { checkAvailability, saveBooking } from "./apiStorage.js";

const form = document.getElementById("formBusqueda");
const contenedor = document.getElementById("resultados");

form.addEventListener("submit", e => {
  e.preventDefault();
  const inicio = form.inicio.value;
  const fin = form.fin.value;
  const personas = parseInt(form.personas.value);

  const disponibles = checkAvailability(inicio, fin).filter(r => r.personas >= personas);

  contenedor.innerHTML = "";
  if (disponibles.length === 0) {
    contenedor.innerHTML = `<p class="text-center text-muted">No hay habitaciones disponibles.</p>`;
    return;
  }

  disponibles.forEach(room => {
    contenedor.innerHTML += `
      <div class="col-md-4">
        <div class="card shadow">
          <img src="assets/img/${room.imagen}" class="card-img-top">
          <div class="card-body">
            <h5 class="card-title">${room.nombre}</h5>
            <p><strong>${room.personas}</strong> personas | ${room.camas} camas</p>
            <p class="text-muted">${room.servicios.join(" • ")}</p>
            <p class="fw-bold text-primary">$${room.precio.toLocaleString()} / noche</p>
            <button class="btn btn-success w-100 reservar" data-id="${room.id}">Reservar</button>
          </div>
        </div>
      </div>`;
  });

  document.querySelectorAll(".reservar").forEach(btn => {
    btn.addEventListener("click", e => {
      const id = parseInt(e.target.dataset.id);
      const noches = Math.ceil((new Date(fin) - new Date(inicio)) / (1000 * 60 * 60 * 24));
      const total = noches * disponibles.find(r => r.id === id).precio;

      saveBooking({ id: Date.now(), roomId: id, inicio, fin, total });
      alert("✅ Reserva realizada con éxito.");
      form.reset();
      contenedor.innerHTML = "";
    });
  });
});
