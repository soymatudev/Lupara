const Logger = require("../utils/Logger");
const QueryHandler = require("../utils/QueryHandler");

/**
 * @returns {Promise<Object>} Empresa information
 */
exports.getAllEmpresasInfo = async () => {
  const sql = `SELECT p.id, p.nombre_proveedor as name, p.direccion as location,
    p.descripcion_corta, p.descripcion_larga, p.rating_promedio, c.nombre_categoria AS service
    FROM reserva.proveedores p, reserva.categorias_servicio c
    WHERE p.id_categoria = c.id`;
  try {
    const results = await QueryHandler.execute(sql, [], "main");
    Logger.info("Fetched empresa information");
    return results;
  } catch (error) {
    Logger.error(`Error fetching empresa info from database: ${error.message}`);
    throw new Error("Failed to fetch empresa info");
  }
};

exports.getEmpresaById = async (empresaId) => {
  const sql = `SELECT p.id, p.nombre_proveedor as nombre_proveedor, p.direccion, p.telefono, p.correo,
    p.descripcion_corta, p.descripcion_larga, p.rating_promedio, c.nombre_categoria AS tipo_servicio
    FROM reserva.proveedores p, reserva.categorias_servicio c
    WHERE p.id_categoria = c.id AND p.id = ?`;
  try {
    const results = await QueryHandler.execute(sql, [empresaId], "main");
    if (results.length === 0) {
      Logger.warn(`No empresa found with ID: ${empresaId}`);
      throw new Error("Empresa not found");
    }
    Logger.info(`Fetched empresa details for ID: ${empresaId}`);
    return results[0];
  } catch (error) {
    Logger.error(
      `Error fetching empresa by ID from database: ${empresaId} ${error.message}`
    );
    throw new Error("Failed to fetch empresa by ID");
  }
};

exports.getEmpresaImages = async (empresaId) => {
  const sql = `select a.url, a.alt_text, b.nombre_ubicacion 
    from recursos.activo a, recursos.ubicacion_activo b 
    where a.id_ubicacion = b.id
    and a.id_proveedor = ?`;
  try {
    const results = await QueryHandler.execute(sql, [empresaId], "main");
    Logger.info(
      `Fetched ${results.length} images for empresa ID: ${empresaId}`
    );
    return results;
  } catch (error) {
    Logger.error(
      `Error fetching empresa images from database: ${error.message}`
    );
    throw new Error("Failed to fetch empresa images");
  }
};

exports.getEmpresaSlots = async (empresaId, selectDate) => {
  const SLOT_DURATION_MINUTES = 30;

  if (!selectDate) {
    Logger.warn("getEmpresaSlots called without a date.");
    return [];
  }
  const targetDate = new Date(selectDate + "T00:00:00");
  const dayOfWeek = targetDate.getDay();

  const resultHorarios = await getEmpresaHorarios(empresaId, dayOfWeek);
  if (resultHorarios.length === 0) {
    Logger.warn(
      `No horarios found for empresa ID: ${empresaId} on day: ${dayOfWeek}`
    );
    return [];
  }
  const { hora_apertura, hora_cierre } = resultHorarios[0];

  const occupiedSlots = await exports.getEmpresaReservasOcupadas(
    empresaId,
    selectDate
  );

  const allSlots = [];
  let currentTime = parseTime(hora_apertura);
  const closingTime = parseTime(hora_cierre);

  while (currentTime + SLOT_DURATION_MINUTES <= closingTime) {
    allSlots.push(formatTime(currentTime));
    currentTime += SLOT_DURATION_MINUTES;
  }

  const availableSlots = allSlots.filter((slot) => {
    const slotStart = new Date(`${selectDate}T${slot}:00`).getTime();
    const slotEnd = slotStart + SLOT_DURATION_MINUTES * 60000;

    const isOccupied = occupiedSlots.some((res) => {
      const resStart = new Date(res.fecha_hora_inicio).getTime();
      const resEnd = new Date(res.fecha_hora_fin).getTime();
      return slotStart < resEnd && slotEnd > resStart;
    });

    return !isOccupied;
  });

  const now = new Date();
  if (targetDate.toDateString() === now.toDateString()) {
    const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();
    return availableSlots.filter((slot) => {
      return parseTime(slot) >= currentTimeInMinutes;
    });
  }

  return availableSlots;
};

const parseTime = (timeStr) => {
  const [hours, minutes, seconds] = timeStr.split(":").map(Number);
  return hours * 60 + minutes; // Devuelve el tiempo en minutos desde medianoche
};

const formatTime = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}`;
};

const getEmpresaHorarios = async (empresaId, dayOfWeek) => {
  try {
    const sql = `SELECT hora_apertura, hora_cierre 
        FROM reserva.horarios 
        WHERE id_proveedor = ? AND dia_semana = ?`;
    const results = await QueryHandler.execute(
      sql,
      [empresaId, dayOfWeek],
      "main"
    );
    Logger.info(
      `Fetched horarios for empresa ID: ${empresaId} on day: ${dayOfWeek}`
    );
    return results;
  } catch (error) {
    Logger.error(
      `Error fetching empresa horarios from database: ${error.message}`
    );
    throw new Error("Failed to fetch empresa horarios");
  }
};

exports.getEmpresaReservasOcupadas = async (empresaId, selectDate) => {
  try {
    Logger.info(
      `Fetching occupied reservas for empresa ID: ${empresaId} on date: ${selectDate}`
    );
    const sql = `SELECT fecha_hora_inicio, fecha_hora_fin
        FROM reserva.reservacion
        WHERE id_proveedor = ?
          AND DATE(fecha_hora_inicio) = ?
          AND id_estado = 2`;
    const results = await QueryHandler.execute(
      sql,
      [empresaId, selectDate],
      "main"
    );
    Logger.info(
      `Fetched occupied reservas for empresa ID: ${empresaId} on date: ${selectDate}`
    );
    return results;
  } catch (error) {
    Logger.error(
      `Error fetching empresa reservas from database: ${error.message}`
    );
    throw new Error("Failed to fetch empresa reservas");
  }
};

/**
 * @returns {Promise<Array>} Featured items
 */
exports.getFeaturedEmpresas = async () => {
  const sql = `select p.id, p.nombre_proveedor as name, p.descripcion_corta, p.direccion as location, 
    p.rating_promedio, p.es_destacado, c.nombre_categoria AS service, url as imageUrl
    from reserva.proveedores p, reserva.categorias_servicio c, recursos.activo a, recursos.ubicacion_activo b
    where p.id_categoria = c.id
    and p.es_destacado = TRUE and p.id IS NOT NULL
    and p.id = a.id_proveedor
    and a.id_ubicacion = b.id
    and b.nombre_ubicacion = 'Portada_Home'
    ORDER BY p.rating_promedio DESC, p.fecha_registro DESC
    `;
  try {
    const results = await QueryHandler.execute(sql, [], "main");
    Logger.info(`Fetched ${results.length} featured items`);
    return results;
  } catch (error) {
    Logger.error(
      `Error fetching featured items from database: ${error.message}`
    );
    throw new Error("Failed to fetch featured items");
  }
};
