@echo off
echo Iniciando Pipeline Local de Integracion Continua...
echo ===================================================

echo.
echo [1/2] Ejecutando Pruebas Unitarias (Jest)...
cd backend
call npm test
set TEST_RESULT=%ERRORLEVEL%
cd ..

if %TEST_RESULT% NEQ 0 (
    echo [ERROR] Las pruebas unitarias fallaron.
    echo Deteniendo el pipeline...
    exit /b %TEST_RESULT%
)
echo [EXITO] Pruebas unitarias aprobadas.

echo.
echo [2/2] Ejecutando Analisis Estatico (ESLint)...
call npx eslint backend/src/
set LINT_RESULT=%ERRORLEVEL%

if %LINT_RESULT% NEQ 0 (
    echo [ERROR] El analisis estatico detecto problemas en el codigo.
    echo Deteniendo el pipeline...
    exit /b %LINT_RESULT%
)
echo [EXITO] Analisis estatico aprobado.

echo.
echo ===================================================
echo [EXITO TOTAL] El pipeline se ejecuto correctamente.
pause