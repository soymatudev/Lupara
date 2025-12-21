const Logger = require("../utils/Logger");
const jwt = require("jsonwebtoken");
const reservacionService = require("../services/reservacionService");

exports.getReservas = async (req, res) => {
  const companyId = req.user.companyId;
  const selectDate = req.query.date || null;
  const userId = req.user.id || null;

  try {
    const reservas = await reservacionService.getReservas(
      companyId,
      selectDate,
      userId
    );
    res.status(200).json(reservas);
  } catch (error) {
    Logger.error(`Error fetching reservas: ${error.message}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getReservacionById = async (req, res) => {
  const reservaId = req.params.id;
  const userId = req.user.id;

  try {
    const reserva = await reservacionService.getReservacionById(
      reservaId,
      userId
    );
    return res.status(200).json(reserva);
  } catch (error) {
    Logger.error(`Error fetching reservacion by ID: ${error.message}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getUserReservaciones = async (req, res) => {
  const userId = req.user.id;
  try {
    const reservas = await reservacionService.getUserReservaciones(userId);
    return res.status(200).json(reservas);
  } catch (error) {
    Logger.error(`Error fetching user reservaciones: ${error.message}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.createReservacion = async (req, res) => {
  const { empresaId, fecha, hora, cantidad } = req.body;
  const token = req.cookies.access_token;
  const jwtData = jwt.verify(token, process.env.JWT_SECRET);
  const userId = jwtData.UserId;

  try {
    const newReservacion = await reservacionService.createReservacion(
      empresaId,
      userId,
      fecha,
      hora,
      cantidad
    );
    return res.status(201)
      .json({ message: "Reserva created successfully", reservacion: newReservacion });
  } catch (error) {
    Logger.error(`Error creating reserva: ${error.message}`);
    return res.status(500).json({ message: "Failed to create reserva" });
  }
};

exports.cancelReservacion = async (req, res) => {
  const reservaId = req.params.id;
  const userId = req.user.id;
  try {
    await reservacionService.cancelReservacion(reservaId, userId);
    return res.status(200).json({ message: "Reserva deleted successfully" });
  } catch (error) {
    Logger.error(`Error deleting reserva: ${error.message}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};
