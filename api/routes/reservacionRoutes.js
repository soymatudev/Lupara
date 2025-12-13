const express = require("express");
const router = express.Router();
const {
  createReservacion,
  getReservacionById,
  getUserReservaciones,
  cancelReservacion,
} = require("../controllers/reservacionController");

router.post("/", createReservacion);

router.get("/:id", getReservacionById);

router.get("/usuario/:userId", getUserReservaciones);

router.delete("/:id", cancelReservacion);

module.exports = router;
