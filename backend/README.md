# Give&Go — Backend API (Node.js / Express / TypeScript)

Módulo encargado de la API REST, autenticación, lógica de negocio y comunicación con la base de datos MySQL (con fallback resiliente en memoria para prototipado).

## Arquitectura del Backend

```text
backend/
├── src/
│   ├── config/          # Conexión DB (MySQL / Fallback) y entorno
│   ├── controllers/     # Controladores HTTP de endpoints
│   ├── middlewares/     # Auth JWT, validación de roles, manejador de errores
│   ├── models/          # Modelos de datos y queries SQL
│   ├── routes/          # Definición de rutas API REST
│   ├── services/        # Lógica de negocio y operaciones desacopladas
│   ├── utils/           # Encriptación, tokens JWT y logger de auditoría
│   ├── validators/      # Reglas express-validator para payloads
│   ├── app.ts           # Inicialización de Express y middlewares
│   └── server.ts        # Punto de arranque, bind a 0.0.0.0 y puerto 3000
├── tests/               # Pruebas automatizadas de API
├── .env                 # Variables de entorno locales
├── .env.example         # Plantilla de variables de entorno
├── package.json         # Dependencias y scripts del backend
└── README.md            # Documentación técnica del módulo
```

## Endpoints Principales

- `POST /api/users/login` — Autenticación de usuarios y emisión de JWT
- `POST /api/users/register` — Registro de voluntarios y beneficiarios
- `GET /api/events` — Catálogo público de convocatorias y voluntariados
- `POST /api/donations` — Procesamiento de donaciones monetarias y en especie
- `GET /api/organizations` — Directorio de ONGs y fundaciones verificadas
- `GET /api/health` — Verificación de salud y estado del servidor
