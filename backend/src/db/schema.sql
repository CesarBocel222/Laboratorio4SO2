CREATE TABLE IF NOT EXISTS productos (
    id_producto INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    precio REAL NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    estado TEXT NOT NULL DEFAULT 'ACTIVO'
);

CREATE TABLE IF NOT EXISTS ventas (
    id_venta INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    subtotal REAL NOT NULL,
    iva REAL NOT NULL,
    total REAL NOT NULL,
    estado_facturacion TEXT NOT NULL DEFAULT 'PENDIENTE',
    usuario_creacion TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS detalle_venta (
    id_detalle INTEGER PRIMARY KEY AUTOINCREMENT,
    id_venta INTEGER NOT NULL,
    id_producto INTEGER NOT NULL,
    cantidad INTEGER NOT NULL,
    precio_unitario REAL NOT NULL,
    subtotal_linea REAL NOT NULL,
    FOREIGN KEY (id_venta) REFERENCES ventas(id_venta),
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
);

INSERT INTO productos (nombre, precio, stock, estado)
SELECT 'Laptop Lenovo IdeaPad', 4500.00, 8, 'ACTIVO'
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Laptop Lenovo IdeaPad');

INSERT INTO productos (nombre, precio, stock, estado)
SELECT 'Mouse Logitech', 125.50, 25, 'ACTIVO'
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Mouse Logitech');

INSERT INTO productos (nombre, precio, stock, estado)
SELECT 'Teclado Redragon', 275.00, 15, 'ACTIVO'
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Teclado Redragon');

INSERT INTO productos (nombre, precio, stock, estado)
SELECT 'Monitor Samsung 24', 1200.00, 10, 'ACTIVO'
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Monitor Samsung 24');

INSERT INTO productos (nombre, precio, stock, estado)
SELECT 'USB Kingston 64GB', 85.00, 30, 'ACTIVO'
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'USB Kingston 64GB');