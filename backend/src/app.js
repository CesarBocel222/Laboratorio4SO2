const express = require('express');
const cors = require('cors');
const db = require('./db/connection');
const ventaRoutes = require('./routes/ventaRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/productos', (req, res) => {
  const sql = `
    SELECT id_producto, nombre, precio, stock, estado
    FROM productos
    WHERE estado = 'ACTIVO'
    ORDER BY nombre
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener productos' });
    }

    res.json(rows);
  });
});

app.use('/api', ventaRoutes);

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});