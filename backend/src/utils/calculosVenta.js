const calcularResumenVenta = (detalleProductos) => { 
    if (!Array.isArray(detalleProductos) || detalleProductos.length === 0) { 
        return { 
            subtotal: 0, 
            iva: 0, 
            total: 0 
        }; 
    } 

    const subtotal = detalleProductos.reduce((acc, item) => { 
        return acc + (item.precio_unitario * item.cantidad); 
    }, 0); 

    const subtotalRedondeado = Number(subtotal.toFixed(2)); 
    const iva = Number((subtotalRedondeado * 0.12).toFixed(2)); 
    const total = Number((subtotalRedondeado + iva).toFixed(2)); 

    return { 
        subtotal: subtotalRedondeado, 
        iva, 
        total 
    }; 
}; 

const validarCantidad = (cantidad, stock) => { 
    if (!Number.isInteger(cantidad)) { 
        return false; 
    } 
    if (cantidad <= 0) { 
        return false; 
    } 
    if (cantidad > stock) { 
        return false; 
    } 
    return true; 
};

module.exports = { 
    calcularResumenVenta, 
    validarCantidad 
}; 