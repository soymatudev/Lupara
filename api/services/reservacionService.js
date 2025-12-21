const dayjs = require("dayjs");
const Logger = require("../utils/Logger");
const QueryHandler = require("../utils/QueryHandler");
const EmpresaService = require("./empresaService");

exports.getReservas = async (empresaId, selectDate = null, userId = null) => {
  const finaltDate = selectDate ? " AND a.date = ?" : "";
  const userFilter = userId ? " AND a.userId = ?" : "";
  let sql = `SELECT a.id, a.date, a.h_ini, a.h_fin, a.status, b.descri 
        FROM reservas a, users b 
        WHERE a.userId = b.id AND a.empresaId = ? ${finaltDate} ${userFilter}
        ORDER BY a.date ASC, a.h_ini ASC`;
  const params = [empresaId];
  if (selectDate) params.push(selectDate);
  if (userId) params.push(userId);

  try {
    const reservas = await QueryHandler.execute(sql, params, "main");
    Logger.info(`Fetched ${reservas.length} reservas for empresaId ${empresaId} on ${selectDate}`);
    return reservas;
  } catch (error) {
    Logger.error(`Error fetching reservas from database: ${error.message}`);
    throw new Error("Failed to fetch reservas");
  }
};

exports.getReservacionById = async (reservaId, userId) => {
  const sql = `SELECT a.id, a.date, a.h_ini, a.h_fin, a.status, b.descri 
        FROM reservas a, users b 
        WHERE a.userId = b.id AND a.id = ? AND a.userId = ?`;
  try {
    const results = await QueryHandler.execute(sql, [reservaId, userId], "main");
    if (results.length === 0) {
      Logger.warn(`No reservacion found with ID: ${reservaId} for user ${userId}`);
      throw new Error("Reservacion not found");
    }
    Logger.info(`Fetched reservacion details for ID: ${reservaId}`);
    return results[0];
  } catch (error) {
    Logger.error(`Error fetching reservacion by ID from database: ${error.message}`);
    throw new Error("Failed to fetch reservacion by ID");
  }
};

exports.getUserReservaciones = async (userId) => {
  const sql = `select a.id, a.fecha_hora_inicio, a.cantidad_pax, 
    c.nombre_estado as estado, b.nombre_proveedor AS nombre_negocio, b.direccion, 
    (SELECT url FROM recursos.activo WHERE id_proveedor = b.id AND id_ubicacion = 1 LIMIT 1) as url_foto
    from reserva.reservacion a, reserva.proveedores b, reserva.estado_reserva c
    where a.id_proveedor = b.id
    and a.id_usuario = ?
    and a.id_estado = c.id
    order by a.fecha_hora_inicio DESC;`;
  try {
    const reservas = await QueryHandler.execute(sql, [userId], "main");
    Logger.info(`Fetched ${reservas.length} reservaciones for userId ${userId}`);
    return reservas;
  } catch (error) {
    Logger.error(`Error fetching user reservaciones from database: ${error.message}`);
    throw new Error("Failed to fetch user reservaciones");
  }
};

exports.createReservacion = async (empresaId, userId, fecha, hora,cantidad) => {
  const reservation_duration = 30;
  const startTimeStr = `${fecha} ${hora}:00`;
  const startDate = new Date(startTimeStr);
  const endDate = new Date( startDate.getTime() + reservation_duration * 60000);
  const endTimeStr = dayjs(endDate).format("YYYY-MM-DD HH:mm:ss");
  const existingReservation = await EmpresaService.getEmpresaReservasOcupadas(
    empresaId,
    fecha
  );

  if (existingReservation.length > 0) {
    Logger.warn( `Attempt to create overlapping reserva for ${empresaId} on ${fecha} at ${hora}`);
  }

  const sql = `INSERT INTO reserva.reservacion 
    (id_proveedor, id_usuario, fecha_hora_inicio, fecha_hora_fin, cantidad_pax, id_estado) 
    VALUES (?, ?, ?, ?, ?, ?) RETURNING *`;
  try {
    const estadoInicial = 2;
    const result = await QueryHandler.execute(
      sql, [empresaId, userId, startTimeStr, endTimeStr, cantidad, estadoInicial], "main");
    Logger.info(`Created reserva for user ${userId}`);
    return result[0];
  } catch (error) {
    Logger.error(`Error creating reserva in database: ${error.message}`);
    throw new Error("Failed to create reserva");
  }
};

/**
 * @param {number} reservaId
 * @param {number} userId
 * @returns
 */
exports.cancelReservacion = async (reservaId, userId) => {
  await checkUserReservation(reservaId, userId);
  const sql = `UPDATE reserva.reservacion
        SET id_estado = 3
        WHERE id = ? AND id_usuario = ?`;
  try {
    const result = await QueryHandler.execute(sql, [reservaId, userId], "main");
    if (result.affectedRows > 0) {
      Logger.info(`Reservacion ${reservaId} cancelled by user ${userId}`);
      return { success: true, message: "Reservacion cancelled successfully" };
    } else {
      Logger.warn( `No reservacion found to cancel for ID ${reservaId} and user ${userId}`);
      return {success: false,message: "No reservacion found or already cancelled",};
    }
  } catch (error) {
    Logger.error(`Error cancelling reservacion: ${error.message}`);
    throw new Error("Failed to cancel reservacion");
  }
};

const checkUserReservation = async (reservaId, userId) => {
  const checkUserSql = `select id_usuario, fecha_hora_inicio 
  from reserva.reservacion where id = ?`;
  const res = await QueryHandler.execute(checkUserSql, [reservaId], "main");
  if (res.length === 0) throw new Error("Reservacion not found");
  if (res[0].id_usuario !== userId) {
    Logger.warn( `User ${userId} attempted to cancel reservacion ${reservaId} not owned by them`);
    throw new Error("Unauthorized to cancel this reservacion");
  }
  const inicio = dayjs(res[0].fecha_hora_inicio);
  if(inicio.isBefore(dayjs().add(2, 'hour'))) {
    Logger.warn( `User ${userId} attempted to cancel past reservacion ${reservaId}`);
    throw new Error("No puedes Cancelar una reservacion con menos de 2 horas de anticipacion");
  }
}