const dayjs = require("dayjs");
const Logger = require("../utils/Logger");
const QueryHandler = require("../utils/QueryHandler");
//const { checkAuth } = require("../middlewares/verifyToken");
const EmpresaService = require("./empresaService");

exports.getReservas = async (empresaId, selectDate = null, userId = null) => {
  const finaltDate = selectDate ? " AND a.date = ?" : "";
  const userFilter = userId ? " AND a.userId = ?" : "";

  let sql = `
        SELECT a.id, a.date, a.h_ini, a.h_fin, a.status, b.descri 
        FROM reservas a, users b 
        WHERE a.userId = b.id AND a.empresaId = ? ${finaltDate} ${userFilter}
        ORDER BY a.date ASC, a.h_ini ASC
    `;
  const params = [empresaId];
  if (selectDate) params.push(selectDate);
  if (userId) params.push(userId);

  try {
    const reservas = await QueryHandler.execute(sql, params, "main");
    Logger.info(
      `Fetched ${reservas.length} reservas for empresaId ${empresaId} on ${selectDate}`
    );
    return reservas;
  } catch (error) {
    Logger.error(`Error fetching reservas from database: ${error.message}`);
    throw new Error("Failed to fetch reservas");
  }
};

exports.getReservacionById = async (reservaId, userId) => {
  const sql = `
        SELECT a.id, a.date, a.h_ini, a.h_fin, a.status, b.descri 
        FROM reservas a, users b 
        WHERE a.userId = b.id AND a.id = ? AND a.userId = ?
    `;
  try {
    const results = await QueryHandler.execute(
      sql,
      [reservaId, userId],
      "main"
    );
    if (results.length === 0) {
      Logger.warn(
        `No reservacion found with ID: ${reservaId} for user ${userId}`
      );
      throw new Error("Reservacion not found");
    }
    Logger.info(`Fetched reservacion details for ID: ${reservaId}`);
    return results[0];
  } catch (error) {
    Logger.error(
      `Error fetching reservacion by ID from database: ${error.message}`
    );
    throw new Error("Failed to fetch reservacion by ID");
  }
};

exports.getUserReservaciones = async (userId) => {
  const sql = `
        SELECT id, date, h_ini, h_fin, status 
        FROM reservas 
        WHERE userId = ? 
        ORDER BY date ASC, h_ini ASC
    `;
  try {
    const reservas = await QueryHandler.execute(sql, [userId], "main");
    Logger.info(
      `Fetched ${reservas.length} reservaciones for userId ${userId}`
    );
    return reservas;
  } catch (error) {
    Logger.error(
      `Error fetching user reservaciones from database: ${error.message}`
    );
    throw new Error("Failed to fetch user reservaciones");
  }
};

exports.createReservacion = async (
  empresaId,
  userId,
  fecha,
  hora,
  cantidad
) => {
  const RESERVATION_DURATION_MINUTES = 30;
  const startTimeStr = `${fecha} ${hora}:00`;
  const startDate = new Date(startTimeStr);
  const endDate = new Date(
    startDate.getTime() + RESERVATION_DURATION_MINUTES * 60000
  );
  const endTimeStr = dayjs(endDate).format("YYYY-MM-DD HH:mm:ss");

  const existingReservation = await EmpresaService.getEmpresaReservasOcupadas(
    empresaId,
    fecha
  );

  if (existingReservation.length > 0) {
    Logger.warn(
      `Attempt to create overlapping reserva for empresaId ${empresaId} on ${fecha} at ${hora}`
    );
  }

  const sql = `
    INSERT INTO reserva.reservacion 
        (id_proveedor, id_usuario, fecha_hora_inicio, fecha_hora_fin, cantidad_pax, id_estado) 
    VALUES (?, ?, ?, ?, ?, ?) RETURNING *`;
  try {
    const estadoInicial = 2;
    const result = await QueryHandler.execute(
      sql,
      [empresaId, userId, startTimeStr, endTimeStr, cantidad, estadoInicial],
      "main"
    );
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
  const sql = `
        UPDATE reservas
        SET status = 'cancelled'
        WHERE id = ? AND userId = ? AND status != 'cancelled'
    `;
  try {
    const result = await QueryHandler.execute(sql, [reservaId, userId], "main");
    if (result.affectedRows > 0) {
      Logger.info(`Reservacion ${reservaId} cancelled by user ${userId}`);
      return { success: true, message: "Reservacion cancelled successfully" };
    } else {
      Logger.warn(
        `No reservacion found to cancel for ID ${reservaId} and user ${userId}`
      );
      return {
        success: false,
        message: "No reservacion found or already cancelled",
      };
    }
  } catch (error) {
    Logger.error(`Error cancelling reservacion: ${error.message}`);
    throw new Error("Failed to cancel reservacion");
  }
};
