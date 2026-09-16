# Give&Go — Plataforma Comunitaria de Voluntariado y Donaciones

**Give&Go** es un ecosistema integral diseñado para conectar a voluntarios comprometidos, donantes solidarios, organizaciones no gubernamentales (ONGs) y beneficiarios en situación de vulnerabilidad, optimizando la gestión social mediante tecnología accesible, segura y transparente.

---

## 📁 Estructura del Repositorio

El proyecto está organizado en una arquitectura modular limpia y desacoplada compuesta por cuatro submódulos principales:

```text
giveandgo/
├── database/            # Infraestructura de datos MySQL, esquemas, migraciones y seeds
├── backend/             # API REST en Node.js / Express / TypeScript con autenticación JWT
├── frontend_web/        # Aplicación web SPA en React 18, Vite y Tailwind CSS
├── frontend_mobile/     # Aplicación móvil en React Native (Expo) con arquitectura por features
├── .gitignore           # Exclusiones globales de Git
└── README.md            # Documentación general del ecosistema Give&Go
```

---

## 🎯 Propósito de Cada Módulo

### 1. `database/`
* **Propósito**: Gestión completa del almacenamiento relacional en MySQL.
* **Componentes**:
  * `schema/`: Esquema consolidado (`giveandgo_schema.sql`) y esquemas individuales por entidad (usuarios, organizaciones, convocatorias, donaciones, beneficiarios, auditoría).
  * `migrations/`: Scripts de evolución de esquema versionados.
  * `seeds/`: Datos iniciales de prueba y catálogo (`initial_seeds.sql`).
* **Documentación detallada**: Ver [`database/README.md`](./database/README.md).

### 2. `backend/`
* **Propósito**: Servidor API RESTful para la lógica de negocio, seguridad, autenticación (JWT/bcrypt) y persistencia.
* **Tecnologías**: Node.js, Express, TypeScript, MySQL2, Helmet, CORS, Express-Validator.
* **Características**:
  * Control de acceso basado en roles (RBAC): Administrador, Organización, Voluntario, Beneficiario.
  * Modo dual de base de datos: Conexión nativa MySQL con fallback automático en memoria para entornos de desarrollo.
* **Documentación detallada**: Ver [`backend/README.md`](./backend/README.md).

### 3. `frontend_web/`
* **Propósito**: Portal web interactivo y responsivo para computadoras y dispositivos móviles.
* **Tecnologías**: React 18, Vite, TypeScript, Tailwind CSS, React Router, Lucide Icons, Leaflet Maps.
* **Vistas principales**:
  * Panel de Administración y verificación de ONGs.
  * Portal de Voluntariado con catálogo de eventos y mapa interactivo de convocatorias.
  * Módulo de Donaciones (monetarias y en especie con cálculo en pesos COP).
  * Solicitudes de asistencia para beneficiarios.
* **Documentación detallada**: Ver [`frontend_web/README.md`](./frontend_web/README.md).

### 4. `frontend_mobile/`
* **Propósito**: Aplicación móvil nativa para voluntarios y beneficiarios en campo.
* **Tecnologías**: React Native, Expo, React Navigation, TypeScript, Lucide Icons Native.
* **Arquitectura**: Modular orientada a características (*Feature-based architecture*):
  * `features/auth`: Registro e inicio de sesión seguro.
  * `features/events`: Exploración, filtros y postulación a voluntariados.
  * `features/donations`: Registro de aportes y seguimiento.
  * `features/beneficiary`: Solicitudes directas de ayuda y recursos.
  * `features/profile`: Perfil de usuario, historial y configuración.
  * `features/notifications`: Alertas de eventos y cambios de estado.
* **Documentación detallada**: Ver [`frontend_mobile/README.md`](./frontend_mobile/README.md).

---

## 🚀 Guía de Inicio Rápido

### Prerrequisitos
* Node.js v18 o superior
* npm v9 o superior (o bun / yarn)
* Servidor MySQL (opcional, disponible fallback automático en desarrollo)

---

### Opción A: Ejecución Unificada del Ecosistema

Desde la raíz del proyecto, puedes iniciar el ecosistema full-stack integrado:

```bash
# Instalar dependencias
npm install

# Iniciar servidor backend y frontend web simultáneamente (puerto 3000)
npm run dev

# Compilar para producción
npm run build

# Iniciar en modo producción
npm start
```

* **Frontend Web**: [http://localhost:3000](http://localhost:3000)
* **Backend API REST**: [http://localhost:3000/api](http://localhost:3000/api)
* **Salud del Servidor**: [http://localhost:3000/api/health](http://localhost:3000/api/health)

---

### Opción B: Ejecución Módulo por Módulo

Cada módulo puede ejecutarse de forma 100% independiente:

#### 1. Levantar la Base de Datos (`database/`)
```bash
# Importar el esquema consolidado en MySQL
mysql -u root -p < database/schema/giveandgo_schema.sql

# Poblar datos iniciales de prueba
mysql -u root -p < database/seeds/initial_seeds.sql
```

#### 2. Levantar el Backend (`backend/`)
```bash
cd backend
npm install
npm run dev
# El backend estará disponible en http://localhost:3000/api
```

#### 3. Levantar el Frontend Web (`frontend_web/`)
```bash
cd frontend_web
npm install
npm run dev
# El frontend web se abrirá en http://localhost:5173
```

#### 4. Levantar la Aplicación Móvil (`frontend_mobile/`)
```bash
cd frontend_mobile
npm install
npx expo start
# Escanear el código QR con Expo Go en Android/iOS o presionar 'a' para emulador Android
```

---

## 🔐 Usuarios y Credenciales de Prueba

| Rol | Correo Electrónico | Contraseña |
| :--- | :--- | :--- |
| **Administrador** | `admin@giveandgo.com` | `Admin123*` |
| **Voluntario** | `carlos@volunteer.com` | `User123*` |
| **Beneficiario** | `juan@beneficiary.com` | `User123*` |
| **Organización** | `contacto@manosporkennedy.org` | `User123*` |

---

## 📄 Licencia

Este proyecto está bajo la Licencia Apache 2.0. Consulta los archivos correspondientes para más información.
