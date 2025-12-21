import { Alerts } from "../shared/Alerts.js";
import { HeaderComponent } from "../shared/components/HeaderComponent.js";
import { RouterViews } from "../shared/RouterViews.js";
import { AuthService } from "../shared/AuthService.js";
import { EmpresaService } from "../shared/EmpresaService.js";
import { ReservacionService } from "../shared/ReservacionService.js";

let providerId = null;

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    providerId = getProviderIdFromUrl();
    if (providerId) {
      fetchProviderDetails(providerId);
      HeaderComponent.loadHeader("main-header");
      setMinDate();
    } else {
      Alerts.showError(
        "URL Inválida",
        "La información del proveedor no está disponible."
      );
    }
    const reservationDateInput = document.getElementById("reservation-date");
    const reservationTimeSelect = document.getElementById("reservation-time");
    reservationDateInput.addEventListener("change", updateAvailableSlots);
  }, 1500);
});

function setMinDate() {
  const reservationDateInput = document.getElementById("reservation-date");
  const today = new Date().toISOString().split('T')[0];
  reservationDateInput.setAttribute('min', today);
}

function getProviderIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("empresaId");
}

async function fetchProviderDetails(id) {
  if (!id) {
    Alerts.showError("Error", "No se especificó un proveedor.");
    return;
  }

  try {
    setTimeout(async () => {
      const response = await EmpresaService.getEmpresaById(id);
      const responseImages = await EmpresaService.getEmpresaImages(id);
      const responseUrlMaps = await EmpresaService.getEmpresaMaps(providerId);

      renderDetails(response);
      renderGallery(responseImages);
      renderMapsSection(responseUrlMaps.sitio_web_maps);
    }, 1500);
  } catch (error) {
    Alerts.showError(
      "Error",
      "No se pudieron cargar los detalles del proveedor.",
      3000
    );
    console.error("Fetch Details Error:", error);
  }
}

function renderDetails(data) {
  document.getElementById("page-title").textContent = data.nombre_proveedor;
  document.getElementById("provider-name").textContent = data.nombre_proveedor;
  document.getElementById("provider-category").textContent = data.tipo_servicio;
  document.getElementById("provider-description").textContent =
    data.descripcion_larga || data.descripcion_corta;
  document.getElementById("provider-address").textContent = data.direccion;
  document.getElementById("provider-phone").textContent = data.telefono;
  document.getElementById("provider-email").textContent = data.correo;

  const ratingHtml = `
        <span class="text-yellow-500 font-bold">${parseFloat(
          data.rating_promedio
        ).toFixed(1)}</span>
        <span class="text-gray-500 ml-2">(${
          data.review_count || 0
        } reseñas)</span>
    `;
  document.getElementById("provider-rating").innerHTML = ratingHtml;
}

function renderGallery(images) {
  const galleryContainer = document.getElementById("image-gallery");
  galleryContainer.innerHTML = "";
  const portada = images.find((img) => img.nombre_ubicacion === "Portada_Home");
  const galeria = images.filter(
    (img) => img.nombre_ubicacion !== "Portada_Home"
  );

  if (!portada && galeria.length === 0) {
    galleryContainer.innerHTML = `
            <div class="col-span-3 h-72 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                No hay imágenes disponibles para este proveedor.
            </div>
        `;
    return;
  }
  if (portada) {
    const portadaHtml = `
            <div class="col-span-2 md:col-span-2 h-72 rounded-lg shadow-md overflow-hidden">
                <img src="${portada.url}" alt="${portada.alt_text}" class="w-full h-full object-cover transition duration-300 hover:scale-[1.03]">
            </div>
        `;
    galleryContainer.innerHTML += portadaHtml;
  }
  galeria.forEach((img) => {
    const itemHtml = `
            <div class="h-36 rounded-lg shadow-md overflow-hidden">
                <img src="${img.url}" alt="${img.alt_text}" class="w-full h-full object-cover transition duration-300 hover:scale-[1.03]">
            </div>
        `;
    galleryContainer.innerHTML += itemHtml;
  });
}

function renderMapsSection(address) {
  if (!address) {
    document.getElementById("maps-section").innerHTML = `
        <div class="h-64 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
            Mapa no disponible para este proveedor.
        </div>
    `;
    return;
  }
  const mapsContainer = document.getElementById("maps-section");
  const mapsHtml = `
      <iframe
        src="${address}"
        style="border: 0"
        allowfullscreen=""
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        class="h-full w-full"
      ></iframe>
    `;
  mapsContainer.innerHTML = mapsHtml;
}

async function updateAvailableSlots() {
  const reservationDateInput = document.getElementById("reservation-date");
  const reservationTimeSelect = document.getElementById("reservation-time");

  const selectedDate = reservationDateInput.value;
  reservationTimeSelect.innerHTML = '<option value="">Cargando...</option>';

  if (!selectedDate || !providerId) {
    reservationTimeSelect.innerHTML =
      '<option value="">Selecciona una fecha</option>';
    return;
  }

  try {
    const response = await EmpresaService.getEmpresaSlots(
      providerId,
      selectedDate
    );
    const slots = response;
    reservationTimeSelect.innerHTML =
      '<option value="">Selecciona una hora</option>';

    if (slots.length === 0) {
      reservationTimeSelect.innerHTML =
        '<option value="">No hay disponibilidad ese día</option>';
    } else {
      slots.forEach((timeSlot) => {
        const option = document.createElement("option");
        option.value = timeSlot;
        option.textContent = timeSlot;
        reservationTimeSelect.appendChild(option);
      });
    }
  } catch (error) {
    Alerts.showError("Error", "Fallo al obtener horarios disponibles.");
    reservationTimeSelect.innerHTML =
      '<option value="">Error de carga</option>';
  }
}

async function isLoggedIn() {
  const loggedIn = await AuthService.isLoggedIn();
  
  if (!loggedIn.loggedIn) {
    Alerts.showError(
      "Acceso Denegado",
      "Debes iniciar sesión para hacer una reserva.",
      3000, RouterViews.auth
    );
    return;
  }
}

function getReservationData() {
  return {
    empresaId: providerId,
    fecha: document.getElementById("reservation-date").value,
    hora: document.getElementById("reservation-time").value,
    cantidad: parseInt(document.getElementById("reservation-pax").value),
  };
}

document.getElementById("reservation-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  isLoggedIn();
  
  const reservationData = getReservationData();

  if (!reservationData.hora) {
    Alerts.showWarning(
      "Atención",
      "Por favor, selecciona una hora disponible.",
      2000
    );
    return;
  }

  try {
    const response = await ReservacionService.createReservacion(
      reservationData
    );
    Alerts.showSuccess("¡Reserva Creada!", response.message, 2000);
    updateAvailableSlots();
  } catch (error) {
    const message = error.response?.data?.message || "Hubo un error al procesar tu solicitud.";
    Alerts.showError("Fallo en la Reserva", message, 3000);
  }
});
