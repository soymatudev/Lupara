const express = require("express");
const router = express.Router();

const {
  getAllEmpresasInfo,
  getEmpresaById,
  getEmpresaImages,
  getEmpresaMaps,
  getEmpresaSlots,
  getFeatured,
} = require("../controllers/empresaController");

router.get("/", getAllEmpresasInfo);

router.get("/destacadas", getFeatured);

router.get("/:id", getEmpresaById);

router.get("/:id/images", getEmpresaImages);

router.get("/:id/maps", getEmpresaMaps);

router.get("/:id/slots/:date", getEmpresaSlots);

module.exports = router;
