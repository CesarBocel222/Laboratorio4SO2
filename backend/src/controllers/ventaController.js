const { registrarVenta } = require('../services/ventaService');

const crearVenta = (req, res) => {
  registrarVenta(req.body, (err, resultado) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    res.status(201).json(resultado);
  });
};

module.exports = { crearVenta };