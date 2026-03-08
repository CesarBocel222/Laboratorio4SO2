const express = require('express');
const router = express.Router();
const { crearVenta } = require('../controllers/ventaController');

router.post('/ventas', crearVenta);

module.exports = router;