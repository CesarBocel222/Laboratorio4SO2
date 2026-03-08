import { useEffect, useMemo, useState } from 'react';
import { obtenerProductos } from '../services/productoService';
import { guardarVenta } from '../services/ventaService';

const RegistroVenta = () => {
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [detalle, setDetalle] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const cargarProductos = async () => {
    try {
      setCargando(true);
      setError('');
      const data = await obtenerProductos();
      setProductos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const productoActual = useMemo(() => {
    return productos.find(
      (item) => item.id_producto === Number(productoSeleccionado)
    );
  }, [productos, productoSeleccionado]);

  const subtotal = useMemo(() => {
    return detalle.reduce((acc, item) => acc + item.subtotal_linea, 0);
  }, [detalle]);

  const iva = useMemo(() => {
    return subtotal * 0.12;
  }, [subtotal]);

  const total = useMemo(() => {
    return subtotal + iva;
  }, [subtotal, iva]);

  const agregarProducto = () => {
    setMensaje('');
    setError('');

    if (!productoSeleccionado) {
      setError('Debes seleccionar un producto');
      return;
    }

    if (!cantidad || Number(cantidad) <= 0) {
      setError('La cantidad debe ser mayor a 0');
      return;
    }

    if (!productoActual) {
      setError('Producto inválido');
      return;
    }

    if (Number(cantidad) > productoActual.stock) {
      setError('La cantidad supera el stock disponible');
      return;
    }

    const cantidadNumero = Number(cantidad);
    const existe = detalle.find(
      (item) => item.id_producto === productoActual.id_producto
    );

    if (existe) {
      const nuevaCantidad = existe.cantidad + cantidadNumero;

      if (nuevaCantidad > productoActual.stock) {
        setError('La suma de cantidades supera el stock disponible');
        return;
      }

      const nuevoDetalle = detalle.map((item) => {
        if (item.id_producto === productoActual.id_producto) {
          return {
            ...item,
            cantidad: nuevaCantidad,
            subtotal_linea: nuevaCantidad * item.precio_unitario
          };
        }

        return item;
      });

      setDetalle(nuevoDetalle);
    } else {
      setDetalle([
        ...detalle,
        {
          id_producto: productoActual.id_producto,
          nombre: productoActual.nombre,
          cantidad: cantidadNumero,
          precio_unitario: Number(productoActual.precio),
          subtotal_linea: Number(productoActual.precio) * cantidadNumero
        }
      ]);
    }

    setProductoSeleccionado('');
    setCantidad(1);
  };

  const quitarProducto = (idProducto) => {
    setDetalle(detalle.filter((item) => item.id_producto !== idProducto));
  };

  const limpiarFormulario = () => {
    setDetalle([]);
    setProductoSeleccionado('');
    setCantidad(1);
  };

  const registrarVenta = async () => {
    try {
      setGuardando(true);
      setError('');
      setMensaje('');

      if (detalle.length === 0) {
        setError('Debes agregar al menos un producto');
        return;
      }

      const payload = {
        usuario_creacion: 'angiepsc',
        detalle: detalle.map((item) => ({
          id_producto: item.id_producto,
          cantidad: item.cantidad
        }))
      };

      const result = await guardarVenta(payload);

      setMensaje(
        `Venta registrada correctamente. ID venta: ${result.id_venta}`
      );

      limpiarFormulario();
      await cargarProductos();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>Registro de Venta</h1>

        {mensaje && <div style={styles.success}>{mensaje}</div>}
        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.card}>
          <h2 style={styles.subtitle}>Agregar producto</h2>

          {cargando ? (
            <p>Cargando productos...</p>
          ) : (
            <div style={styles.formGrid}>
              <div style={styles.field}>
                <label style={styles.label}>Producto</label>
                <select
                  value={productoSeleccionado}
                  onChange={(e) => setProductoSeleccionado(e.target.value)}
                  style={styles.input}
                >
                  <option value="">Seleccione un producto</option>
                  {productos.map((producto) => (
                    <option
                      key={producto.id_producto}
                      value={producto.id_producto}
                    >
                      {producto.nombre} | Q{Number(producto.precio).toFixed(2)} |
                      Stock: {producto.stock}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Cantidad</label>
                <input
                  type="number"
                  min="1"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.buttonWrap}>
                <button onClick={agregarProducto} style={styles.primaryButton}>
                  Agregar al detalle
                </button>
              </div>
            </div>
          )}

          {productoActual && (
            <div style={styles.infoBox}>
              <p>
                <strong>Precio:</strong> Q
                {Number(productoActual.precio).toFixed(2)}
              </p>
              <p>
                <strong>Stock disponible:</strong> {productoActual.stock}
              </p>
            </div>
          )}
        </div>

        <div style={styles.card}>
          <h2 style={styles.subtitle}>Detalle de venta</h2>

          {detalle.length === 0 ? (
            <p>No hay productos agregados.</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Producto</th>
                  <th style={styles.th}>Cantidad</th>
                  <th style={styles.th}>Precio unitario</th>
                  <th style={styles.th}>Subtotal línea</th>
                  <th style={styles.th}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {detalle.map((item) => (
                  <tr key={item.id_producto}>
                    <td style={styles.td}>{item.nombre}</td>
                    <td style={styles.td}>{item.cantidad}</td>
                    <td style={styles.td}>
                      Q{Number(item.precio_unitario).toFixed(2)}
                    </td>
                    <td style={styles.td}>
                      Q{Number(item.subtotal_linea).toFixed(2)}
                    </td>
                    <td style={styles.td}>
                      <button
                        onClick={() => quitarProducto(item.id_producto)}
                        style={styles.dangerButton}
                      >
                        Quitar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={styles.card}>
          <h2 style={styles.subtitle}>Resumen</h2>

          <div style={styles.summary}>
            <p>
              <strong>Subtotal:</strong> Q{subtotal.toFixed(2)}
            </p>
            <p>
              <strong>IVA (12%):</strong> Q{iva.toFixed(2)}
            </p>
            <p style={styles.total}>
              <strong>Total:</strong> Q{total.toFixed(2)}
            </p>
          </div>

          <div style={styles.actions}>
            <button
              onClick={registrarVenta}
              style={styles.primaryButton}
              disabled={guardando}
            >
              {guardando ? 'Guardando...' : 'Guardar venta'}
            </button>

            <button onClick={limpiarFormulario} style={styles.secondaryButton}>
              Limpiar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f4f6f8',
    padding: '24px',
    fontFamily: 'Arial, sans-serif'
  },
  container: {
    maxWidth: '1100px',
    margin: '0 auto'
  },
  title: {
    textAlign: 'center',
    marginBottom: '24px',
    color: '#1f2937'
  },
  subtitle: {
    marginTop: 0,
    marginBottom: '16px',
    color: '#111827'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr auto',
    gap: '16px',
    alignItems: 'end'
  },
  field: {
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    marginBottom: '8px',
    fontWeight: 'bold',
    color: '#374151'
  },
  input: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '14px'
  },
  buttonWrap: {
    display: 'flex',
    alignItems: 'end'
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 16px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  secondaryButton: {
    backgroundColor: '#e5e7eb',
    color: '#111827',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 16px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  dangerButton: {
    backgroundColor: '#dc2626',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 12px',
    cursor: 'pointer'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    textAlign: 'left',
    padding: '12px',
    borderBottom: '1px solid #d1d5db',
    backgroundColor: '#f9fafb'
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #e5e7eb'
  },
  summary: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '16px'
  },
  total: {
    fontSize: '18px',
    color: '#111827'
  },
  actions: {
    display: 'flex',
    gap: '12px'
  },
  success: {
    backgroundColor: '#dcfce7',
    color: '#166534',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '16px'
  },
  error: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '16px'
  },
  infoBox: {
    marginTop: '16px',
    backgroundColor: '#eff6ff',
    padding: '12px',
    borderRadius: '8px'
  }
};

export default RegistroVenta;