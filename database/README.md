# Give&Go — Base de Datos (MySQL)

Este módulo contiene toda la infraestructura de datos del ecosistema **Give&Go**.

## Estructura del Directorio

```text
database/
├── migrations/
│   ├── 001_initial_schema.sql
│   └── 002_add_verification_to_organizations.sql
├── seeds/
│   ├── 01_categories.sql
│   ├── 02_users.sql
│   ├── 03_organizations.sql
│   ├── 04_events.sql
│   ├── 05_requests.sql
│   ├── 06_donations.sql
│   ├── 07_audits.sql
│   └── initial_seeds.sql
├── schema/
│   ├── users.sql
│   ├── organizations.sql
│   ├── categories.sql
│   ├── events.sql
│   ├── donations.sql
│   ├── requests.sql
│   ├── audits.sql
│   ├── verifications.sql
│   └── giveandgo_schema.sql
└── README.md
```

## Instrucciones de Instalación en MySQL / phpMyAdmin / XAMPP

1. Iniciar el servicio **MySQL** en XAMPP o Docker.
2. Abrir **phpMyAdmin** (`http://localhost/phpmyadmin`) o conectarse por consola:
   ```bash
   mysql -u root -p
   ```
3. Ejecutar el esquema consolidado:
   ```sql
   SOURCE database/schema/giveandgo_schema.sql;
   ```
4. Poblar los datos de prueba y catálogo inicial:
   ```sql
   SOURCE database/seeds/initial_seeds.sql;
   ```

## Credenciales por Defecto (Entorno de Desarrollo)

- **Administrador:** `admin@giveandgo.com` / `Admin123*`
- **Voluntario:** `carlos@volunteer.com` / `User123*`
- **Beneficiario:** `juan@beneficiary.com` / `User123*`
- **Organización:** `contacto@manosporkennedy.org` / `User123*`
