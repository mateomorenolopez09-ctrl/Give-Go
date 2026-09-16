# Give&Go — Frontend Web (React + Vite + Tailwind CSS)

Aplicación web oficial de **Give&Go**. Proporciona interfaces ricas para administradores, voluntarios, beneficiarios y organizaciones sociales.

## Arquitectura de Carpetas

```text
frontend_web/
├── src/
│   ├── assets/              # Iconos, imágenes y recursos estáticos
│   ├── components/          # Componentes modulares
│   │   ├── common/          # Botones, inputs, badges y modales genéricos
│   │   ├── navigation/      # Barras de navegación superior, sidebar y footer
│   │   ├── events/          # Mapas y tarjetas de convocatorias
│   │   ├── donations/       # Tarjetas y formularios de donaciones
│   │   ├── organizations/   # Tarjetas de ONG y estados de verificación
│   │   └── admin/           # Paneles y métricas de administración
│   ├── contexts/            # Contexto global de autenticación (AuthContext)
│   ├── hooks/               # Custom hooks (useAuth, useEvents, useDonations)
│   ├── layouts/             # DashboardLayout y PublicLayout
│   ├── pages/               # Vistas estructuradas por dominio
│   │   ├── Auth/            # Login, Registro, Recuperación de contraseña
│   │   ├── Home/            # Página de inicio comunitaria
│   │   ├── Events/          # Explorador de convocatorias con filtros
│   │   ├── Map/             # Vista satelital e interactiva de eventos en Bogotá
│   │   ├── Donations/       # Portal de donaciones monetarias y en especie
│   │   ├── Organizations/   # Gestión y perfil de fundaciones
│   │   ├── Admin/           # Panel maestro de auditoría, verificación y usuarios
│   │   ├── Beneficiary/     # Portal de ayuda y solicitudes de beneficiarios
│   │   ├── Volunteer/       # Convocatorias inscritas y horas de voluntariado
│   │   └── Profile/         # Perfil público y configuración de privacidad
│   ├── routes/              # Definición de rutas protegidas y públicas
│   ├── services/            # Clientes HTTP y conexión a la API REST del backend
│   ├── types/               # Tipado estricto de TypeScript
│   ├── utils/               # Formateadores de moneda COP, fechas y utilitarios
│   ├── App.tsx              # Componente raíz con AuthProvider y Router
│   ├── main.tsx             # Punto de montaje en el DOM
│   └── index.css            # Configuración de estilos Tailwind CSS
├── public/                  # Recursos públicos servidos directamente
├── .env                     # Variables de entorno para Vite
├── .env.example             # Ejemplo de variables de entorno
├── package.json             # Dependencias del frontend web
└── README.md                # Documentación técnica
```
