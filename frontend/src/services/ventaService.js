export const guardarVenta = async (data) => {
  const response = await fetch('http://localhost:3001/api/ventas', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'No se pudo guardar la venta');
  }

  return result;
};