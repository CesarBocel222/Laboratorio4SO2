const {
  calcularResumenVenta,
  validarCantidad
} = require('../src/utils/calculosVenta');

describe('Pruebas unitarias del módulo de ventas', () => {
  test('calcula correctamente subtotal, IVA y total de una venta', () => {
    const detalle = [
      { precio_unitario: 4500, cantidad: 1 },
      { precio_unitario: 125.5, cantidad: 2 }
    ];
    
    const resultado = calcularResumenVenta(detalle);
    
    expect(resultado.subtotal).toBe(4751);
    expect(resultado.iva).toBe(570.12);
    expect(resultado.total).toBe(5321.12);
  });

  test('rechaza una cantidad mayor al stock disponible', () => {
    expect(validarCantidad(12, 5)).toBe(false);
  });
});