const Logger = require("../utils/Logger");
const QueryHandler = require("../utils/QueryHandler");
const dayjs = require('dayjs');

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
    Logger.error(`Error fetching empresa by ID from database: ${empresaId} ${error.message}`);
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
    Logger.info(`Fetched ${results.length} images for empresa ID: ${empresaId}`);
    return results;
  } catch (error) {
    Logger.error(`Error fetching empresa images from database: ${error.message}`);
    throw new Error("Failed to fetch empresa images");
  }
};

exports.getEmpresaMaps = async (empresaId) => {
  const sql = `select sitio_web_maps from reserva.proveedores where id = ?`;
  try {
    const results = await QueryHandler.execute(sql, [empresaId], "main");
    Logger.info(`Fetched ${results.length} maps for empresa ID: ${empresaId}`);
    return results[0];
  } catch (error) {
    Logger.error(`Error fetching empresa maps from database: ${error.message}`);
    throw new Error("Failed to fetch empresa maps");
  }
};

exports.getEmpresaSlots = async (empresaId, selectDate) => {
  const slot_duration = 30;

  if (!selectDate) return [];

  const targetDate = dayjs(selectDate); //(YYYY-MM-DD)
  const isToday = targetDate.isSame(dayjs(), 'day');
  const dayOfWeek = targetDate.day(); // 0 (Dom) - 6 (Sáb)

  const resultHorarios = await getEmpresaHorarios(empresaId, dayOfWeek);
  if (resultHorarios.length === 0) return [];

  const { hora_apertura, hora_cierre } = resultHorarios[0];
  let start = dayjs(`${selectDate} ${hora_apertura}`);
  const end = dayjs(`${selectDate} ${hora_cierre}`);

  if (isToday) {
    const now = dayjs();
    if (now.isAfter(start)) {
      const minutesToWait = slot_duration - (now.minute() % slot_duration);
      start = now.add(minutesToWait, 'minute').second(0).millisecond(0);
    }
  }

  const slotsOcupados = await exports.getEmpresaReservasOcupadas(empresaId, selectDate);
  const availableSlots = [];
  let currentSlot = start;

  while (currentSlot.add(slot_duration, 'minute').isBefore(end) 
        || currentSlot.add(slot_duration, 'minute').isSame(end)) {
    const slotStart = currentSlot;
    const slotEnd = currentSlot.add(slot_duration, 'minute');

    const isOccupied = slotsOcupados.some((res) => {
      const resStart = dayjs(res.fecha_hora_inicio);
      const resEnd = dayjs(res.fecha_hora_fin);
      return slotStart.isBefore(resEnd) && slotEnd.isAfter(resStart);
    });

    if (!isOccupied) availableSlots.push(currentSlot.format('HH:mm'));
    currentSlot = currentSlot.add(slot_duration, 'minute');
  }

  return availableSlots;
};

const getEmpresaHorarios = async (empresaId, dayOfWeek) => {
  try {
    const sql = `SELECT hora_apertura, hora_cierre 
        FROM reserva.horarios 
        WHERE id_proveedor = ? AND dia_semana = ?`;
    const results = await QueryHandler.execute(sql, [empresaId, dayOfWeek], "main" );
    Logger.info(`Fetched horarios for empresa ID: ${empresaId} on day: ${dayOfWeek}`);
    return results;
  } catch (error) {
    Logger.error(`Error fetching empresa horarios from database: ${error.message}`);
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
    const results = await QueryHandler.execute(sql, [empresaId, selectDate], "main" );
    Logger.info( `Fetched occupied reservas for empresa ID: ${empresaId} on date: ${selectDate}`);
    return results;
  } catch (error) {
    Logger.error(`Error fetching empresa reservas from database: ${error.message}`);
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
    Logger.error(`Error fetching featured items from database: ${error.message}`);
    throw new Error("Failed to fetch featured items");
  }
};
