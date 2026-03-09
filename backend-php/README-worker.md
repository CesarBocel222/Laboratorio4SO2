# Módulo Background Worker - Laboratorio 4 SO2

Este módulo implementa el **Background Worker** asíncrono usando **PHP + Laravel + Redis** para procesar tareas como timbrado fiscal (SAT) y sincronización contable, sin bloquear el flujo principal de ventas del backend Node.js.

Está alineado con el diagrama C4 y el Laboratorio 3:  
- PHP CLI / Queue con Redis  
- Procesamiento asíncrono de eventos críticos  
- Reintentos automáticos y logging de fallos

**Nota importante**: Este es un módulo separado (subcarpeta `backend-php/`) que **comparte la misma base de datos SQLite** (`laboratorio4so2.db`) con el backend Node.js. No reemplaza el backend principal, solo agrega el worker.

## Requisitos previos

- **PHP** >= 8.1 (ideal 8.2 o 8.3) → verifica con `php -v`
- **Composer** instalado → `composer --version`
- **Redis server** corriendo en localhost:6379 (por defecto)
  - Opción más fácil: Docker
    ```bash
    docker run -d --name redis-lab -p 6379:6379 redis:latest