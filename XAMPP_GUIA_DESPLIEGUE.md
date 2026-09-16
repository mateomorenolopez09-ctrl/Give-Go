# 🚀 Guía Completa de Conexión y Despliegue con XAMPP (Give&Go)

Esta guía explica paso a paso cómo descargar, configurar la base de datos en **XAMPP / phpMyAdmin**, levantar el backend con **Node.js + Express** y ejecutar la aplicación web y móvil.

---

## 📋 Requisitos Previos

1. **XAMPP** instalado (con módulos **Apache** y **MySQL**). Puedes descargarlo desde [apachefriends.org](https://www.apachefriends.org/).
2. **Node.js** (versión 18 o superior) y **npm** instalados. Puedes descargarlo desde [nodejs.org](https://nodejs.org/).
3. Un editor de código como **VS Code**.

---

## 🗄️ Paso 1: Configurar la Base de Datos en XAMPP

1. **Iniciar Servicios en XAMPP**:
   - Abre el **XAMPP Control Panel**.
   - Haz clic en **Start** al lado del módulo **Apache**.
   - Haz clic en **Start** al lado del módulo **MySQL**.
   - Verifica que ambos botones cambien a verde.

2. **Abrir phpMyAdmin**:
   - En tu navegador, ingresa a: [`http://localhost/phpmyadmin`](http://localhost/phpmyadmin)

3. **Importar la Base de Datos (1 solo clic)**:
   - En el menú superior de phpMyAdmin, haz clic en la pestaña **Importar** (*Import*).
   - Haz clic en **Seleccionar archivo** (*Choose File*).
   - Busca y selecciona el archivo del proyecto ubicado en:
     ```text
     database/giveandgo_full_xampp.sql
     ```
   - Baja hasta el final de la página y presiona el botón **Continuar** (*Import / Go*).
   - ¡Listo! Se habrá creado automáticamente la base de datos `giveandgo_v2` con todas sus tablas, relaciones y datos iniciales de prueba.

---

## ⚙️ Paso 2: Configurar las Variables de Entorno (`.env`)

En la raíz del proyecto, crea un archivo llamado `.env` (o copia el `.env.example` y renómbralo a `.env`).

Asegúrate de que tenga los siguientes valores para conectarse a XAMPP:

```env
# Servidor
PORT=3000
NODE_ENV=development
JWT_SECRET=giveandgo_super_secret_jwt_key_2025

# Conexión MySQL de XAMPP (Valores por defecto de XAMPP)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=giveandgo_v2

# URL de la API para el frontend
VITE_API_URL=http://localhost:3000/api
```

> 💡 **Nota sobre la contraseña de MySQL en XAMPP**: Por defecto, el usuario `root` de XAMPP **no tiene contraseña** (se deja vacío `DB_PASSWORD=`). Si le asignaste una contraseña personalizada en phpMyAdmin, colócala en `DB_PASSWORD`.

---

## 🚀 Paso 3: Instalar Dependencias y Ejecutar el Proyecto

1. Abre tu terminal (PowerShell, CMD o la terminal integrada de VS Code) en la carpeta raíz del proyecto.
2. Instala todas las dependencias necesarias:
   ```bash
   npm install
   ```

3. Inicia el servidor de desarrollo full-stack (Backend + Frontend Web integrados):
   ```bash
   npm run dev
   ```

4. Abre tu navegador en:
   ```text
   http://localhost:3000
   ```

---

## 👥 Cuentas de Acceso Predefinidas para Pruebas

La base de datos incluye cuentas ya creadas para cada rol con el fin de que puedas probar todas las funcionalidades de inmediato:

| Rol | Correo Electrónico | Contraseña | Descripción / Acceso |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@giveandgo.com` | `Admin123*` | Panel administrativo, auditorías, gestión de usuarios y postulaciones |
| **Organización** | `contacto@manosporkennedy.org` | `User123*` | Gestión de eventos, donaciones recibidas y postulaciones |
| **Voluntario** | `carlos@volunteer.com` | `User123*` | Inscripción en eventos, donaciones monetarias y de objetos |
| **Beneficiario** | `juan@beneficiary.com` | `User123*` | Solicitudes de apoyo social, postulaciones de asistencia |

---

## 🌐 Paso 4: (Opcional) Despliegue en Carpeta `htdocs` de XAMPP

Si deseas servir la aplicación compilada directamente con el servidor Apache de XAMPP:

1. Genera la versión de producción:
   ```bash
   npm run build
   ```
2. Esto creará una carpeta `dist/` con los archivos estáticos optimizados.
3. Copia el contenido de `dist/` dentro de tu carpeta de XAMPP (por ejemplo en `C:\xampp\htdocs\giveandgo`).
4. Inicia el backend ejecutando `npm start` para responder a las rutas de `/api`.

---

## 🔧 Solución de Problemas Frecuentes

1. **Error: "Port 3306 in use" en XAMPP**:
   - Si tienes otra instancia de MySQL Server instalada en Windows, cámbiale el puerto en el botón *Config* de XAMPP (por ejemplo al 3307) y actualiza `DB_PORT=3307` en tu `.env`.

2. **Error: "Access denied for user 'root'@'localhost'"**:
   - Verifica si tu usuario `root` de MySQL tiene contraseña configurada en phpMyAdmin y agrégala en `DB_PASSWORD=tu_password`.

3. **Fallback Automático**:
   - Si MySQL en XAMPP no está encendido, Give&Go activará automáticamente el motor seguro de almacenamiento en JSON para que la aplicación nunca se caiga y puedas seguir usándola localmente.
