const express = require('express');
const router = express.Router();

const { getDisponibilidad, getReservasUsuario } = require('../controllers/reservaController');

//router.get('/disponibilidad', getDisponibilidad);

//router.get('/usuario', getReservasUsuario);

module.exports = router;