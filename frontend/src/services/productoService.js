export const obtenerProductos = async () => {
  const response = await fetch('http://localhost:3001/api/productos');

  if (!response.ok) {
    throw new Error('No se pudieron obtener los productos');
  }

  return await response.json();
};