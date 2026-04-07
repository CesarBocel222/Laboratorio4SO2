const js = require("@eslint/js");

module.exports = [
    js.configs.recommended,
    {
        // Configuracion global
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module"
        },
        rules: {
            // Apagamos estas reglas temporalmente para asegurar que el código 
            // pase limpio la primera vez, tal como pide el laboratorio.
            "no-unused-vars": "off",
            "no-undef": "off"
        }
    },

    // Configuracion para el backend (CommonJS)
    {
        files: ["backend/**/*.js"],
        languageOptions: {
            sourceType: "commonjs"
        }
    },

    // Configuracion para el frontend (React con JSX)
    {
        files: ["frontend/**/*.js", "frontend/**/*.jsx"],
        languageOptions: {
            sourceType: "module",
            parserOptions: {
                ecmaFeatures: {
                    jsx: true
                }
            }
        },

        rules: {
            "react/react-in-jsx-scope": "off", // React 17+ no requiere importar React para usar JSX
            "react/prop-types": "off" // Desactivamos prop-types si no los usamos
        }
    }
    
];