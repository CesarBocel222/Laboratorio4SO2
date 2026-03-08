import { useEffect, useMemo, useState } from 'react';
import { obtenerProductos } from '../services/productoService';
import { guardarVenta } from '../services/ventaService';
import '../styles/ventas.css';

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

  const iva = useMemo(() => subtotal * 0.12, [subtotal]);

  const total = useMemo(() => subtotal + iva, [subtotal, iva]);

  const totalProductos = useMemo(() => {
    return detalle.reduce((acc, item) => acc + item.cantidad, 0);
  }, [detalle]);

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
          subtotal_linea: Number(productoActual.precio) * cantidadNumero,
          stock: productoActual.stock
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
    setMensaje('');
    setError('');
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

      setMensaje(`Venta registrada correctamente. ID venta: ${result.id_venta}`);
      limpiarFormulario();
      await cargarProductos();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="sales-page">
      <div className="sales-shell">
        <header className="sales-header">
          <div>
          
            <h1>Registro de Venta</h1>
           
          </div>

          
        </header>

        {mensaje && <div className="alert success-alert">{mensaje}</div>}
        {error && <div className="alert error-alert">{error}</div>}

        <div className="sales-grid">
          <section className="main-column">
            <div className="card glass-card">
              <div className="card-head">
                <div>
                  <p className="section-kicker">Captura</p>
                  <h2>Agregar producto</h2>
                </div>
              </div>

              {cargando ? (
                <div className="loading-box">Cargando productos...</div>
              ) : (
                <>
                  <div className="form-grid">
                    <div className="field field-large">
                      <label>Producto</label>
                      <select
                        value={productoSeleccionado}
                        onChange={(e) => setProductoSeleccionado(e.target.value)}
                      >
                        <option value="">Seleccione un producto</option>
                        {productos.map((producto) => (
                          <option
                            key={producto.id_producto}
                            value={producto.id_producto}
                          >
                            {producto.nombre} | Q{Number(producto.precio).toFixed(2)} | Stock: {producto.stock}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="field">
                      <label>Cantidad</label>
                      <input
                        type="number"
                        min="1"
                        value={cantidad}
                        onChange={(e) => setCantidad(e.target.value)}
                      />
                    </div>

                    <div className="field button-field">
                      <button className="primary-btn" onClick={agregarProducto}>
                        Agregar al detalle
                      </button>
                    </div>
                  </div>

                  {productoActual && (
                    <div className="product-highlight">
                      <div className="highlight-item">
                        <span>Precio unitario</span>
                        <strong>Q{Number(productoActual.precio).toFixed(2)}</strong>
                      </div>
                      <div className="highlight-item">
                        <span>Stock disponible</span>
                        <strong>{productoActual.stock}</strong>
                      </div>
                      <div className="highlight-item">
                        <span>Estado</span>
                        <strong>{productoActual.estado}</strong>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="card">
              <div className="card-head">
                <div>
                  <p className="section-kicker">Operación</p>
                  <h2>Detalle de venta</h2>
                </div>
                <span className="table-counter">{detalle.length} producto(s)</span>
              </div>

              {detalle.length === 0 ? (
                <div className="empty-state">
                  <h3>Aún no has agregado productos</h3>
                  <p>Selecciona un producto, indica la cantidad y agrégalo al detalle.</p>
                </div>
              ) : (
                <div className="table-wrap">
                  <table className="sales-table">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Precio unitario</th>
                        <th>Subtotal línea</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detalle.map((item) => (
                        <tr key={item.id_producto}>
                          <td>
                            <div className="product-cell">
                              <strong>{item.nombre}</strong>
                              <span>Stock original: {item.stock}</span>
                            </div>
                          </td>
                          <td>{item.cantidad}</td>
                          <td>Q{Number(item.precio_unitario).toFixed(2)}</td>
                          <td className="amount-cell">
                            Q{Number(item.subtotal_linea).toFixed(2)}
                          </td>
                          <td>
                            <button
                              className="danger-btn"
                              onClick={() => quitarProducto(item.id_producto)}
                            >
                              Quitar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          <aside className="side-column">
            <div className="card summary-card">
              <div className="card-head">
                <div>
                  <p className="section-kicker">Resumen</p>
                  <h2>Totales de la venta</h2>
                </div>
              </div>

              <div className="summary-list">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <strong>Q{subtotal.toFixed(2)}</strong>
                </div>
                <div className="summary-row">
                  <span>IVA (12%)</span>
                  <strong>Q{iva.toFixed(2)}</strong>
                </div>
                <div className="summary-divider" />
                <div className="summary-row total-row">
                  <span>Total</span>
                  <strong>Q{total.toFixed(2)}</strong>
                </div>
              </div>

              <div className="summary-extra">
                <div className="summary-chip">
                  <span>Productos</span>
                  <strong>{detalle.length}</strong>
                </div>
                <div className="summary-chip">
                  <span>Unidades</span>
                  <strong>{totalProductos}</strong>
                </div>
              </div>

              <div className="action-stack">
                <button
                  className="primary-btn full-btn"
                  onClick={registrarVenta}
                  disabled={guardando}
                >
                  {guardando ? 'Guardando...' : 'Guardar venta'}
                </button>

                <button className="secondary-btn full-btn" onClick={limpiarFormulario}>
                  Limpiar formulario
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default RegistroVenta;