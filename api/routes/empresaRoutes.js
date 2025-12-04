const express = require('express');
const router = express.Router();

const { getAllEmpresasInfo, getFeatured } = require('../controllers/empresaController');

router.get('/', getAllEmpresasInfo);

router.get('/destacadas', getFeatured);

module.exports = router;