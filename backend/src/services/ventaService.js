const db = require('../db/connection');

const registrarVenta = (data, callback) => {
  const { usuario_creacion, detalle } = data;

  if (!usuario_creacion || !Array.isArray(detalle) || detalle.length === 0) {
    return callback(new Error('Datos de venta incompletos'));
  }

  for (const item of detalle) {
    if (!item.id_producto || !item.cantidad || item.cantidad <= 0) {
      return callback(new Error('Detalle de venta inválido'));
    }
  }

  const idsProductos = detalle.map(item => item.id_producto);
  const placeholders = idsProductos.map(() => '?').join(',');

  db.all(
    `SELECT id_producto, nombre, precio, stock FROM productos WHERE id_producto IN (${placeholders})`,
    idsProductos,
    (err, productos) => {
      if (err) {
        return callback(new Error('Error al consultar productos'));
      }

      if (productos.length !== detalle.length) {
        return callback(new Error('Uno o más productos no existen'));
      }

      let subtotal = 0;
      const detalleCalculado = [];

      for (const item of detalle) {
        const producto = productos.find(p => p.id_producto === item.id_producto);

        if (!producto) {
          return callback(new Error(`Producto no encontrado: ${item.id_producto}`));
        }

        if (item.cantidad > producto.stock) {
          return callback(new Error(`Stock insuficiente para ${producto.nombre}`));
        }

        const subtotalLinea = producto.precio * item.cantidad;
        subtotal += subtotalLinea;

        detalleCalculado.push({
          id_producto: producto.id_producto,
          cantidad: item.cantidad,
          precio_unitario: producto.precio,
          subtotal_linea: subtotalLinea
        });
      }

      const iva = subtotal * 0.12;
      const total = subtotal + iva;

      db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        db.run(
          `INSERT INTO ventas (subtotal, iva, total, estado_facturacion, usuario_creacion)
           VALUES (?, ?, ?, ?, ?)`,
          [subtotal, iva, total, 'PENDIENTE', usuario_creacion],
          function (err) {
            if (err) {
              db.run('ROLLBACK');
              return callback(new Error('Error al insertar venta'));
            }

            const idVenta = this.lastID;
            let pendientes = detalleCalculado.length;
            let huboError = false;

            detalleCalculado.forEach(item => {
              db.run(
                `INSERT INTO detalle_venta (id_venta, id_producto, cantidad, precio_unitario, subtotal_linea)
                 VALUES (?, ?, ?, ?, ?)`,
                [idVenta, item.id_producto, item.cantidad, item.precio_unitario, item.subtotal_linea],
                (err) => {
                  if (err && !huboError) {
                    huboError = true;
                    db.run('ROLLBACK');
                    return callback(new Error('Error al insertar detalle de venta'));
                  }

                  db.run(
                    `UPDATE productos
                     SET stock = stock - ?
                     WHERE id_producto = ?`,
                    [item.cantidad, item.id_producto],
                    (err) => {
                      if (err && !huboError) {
                        huboError = true;
                        db.run('ROLLBACK');
                        return callback(new Error('Error al actualizar stock'));
                      }

                      pendientes--;

                      if (pendientes === 0 && !huboError) {
                        db.run('COMMIT', (err) => {
                          if (err) {
                            db.run('ROLLBACK');
                            return callback(new Error('Error al confirmar la transacción'));
                          }

                          callback(null, {
                            mensaje: 'Venta registrada correctamente',
                            id_venta: idVenta,
                            subtotal,
                            iva,
                            total
                          });
                        });
                      }
                    }
                  );
                }
              );
            });
          }
        );
      });
    }
  );
};

module.exports = { registrarVenta };