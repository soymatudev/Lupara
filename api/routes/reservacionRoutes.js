const express = require("express");
const router = express.Router();
const checkAuth = require("../middlewares/checkAuth");
const {
  createReservacion,
  getReservacionById,
  getUserReservaciones,
  cancelReservacion,
} = require("../controllers/reservacionController");

router.post("/", checkAuth, createReservacion);

router.get("/mis-reservas", checkAuth, getUserReservaciones);

router.get("/:id", checkAuth, getReservacionById);

router.delete("/:id", checkAuth, cancelReservacion);

module.exports = router;
