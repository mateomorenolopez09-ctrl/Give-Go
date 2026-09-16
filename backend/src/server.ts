import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno locales de backend/.env y de raíz si existen
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import app from './app';
import { initDB } from './config/db';
import { createServer as createViteServer } from 'vite';

const PORT = parseInt(process.env.PORT || '3000', 10);

async function startServer() {
  // 1. Inicializar Base de Datos (con auto-fallback si no se detecta MySQL activo)
  await initDB();

  // 2. Configurar Vite para Servir el Frontend de React en Desarrollo
  if (process.env.NODE_ENV !== 'production') {
    console.log('⚡ Iniciando servidor de desarrollo de Vite...');
    const frontendDir = path.resolve(process.cwd(), 'frontend_web');
    const vite = await createViteServer({
      root: frontendDir,
      server: { middlewareMode: true },
      appType: 'spa',
    });
    // Montar el middleware de Vite para que procese las peticiones estáticas y HMR del frontend
    app.use(vite.middlewares);
  } else {
    // Servir archivos estáticos construidos en el directorio /dist en producción
    const distPath = path.join(process.cwd(), 'dist');
    app.use(expressStatic(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // 3. Escuchar en Host 0.0.0.0 y puerto 3000 (obligatorio en Cloud Run / contenedores sandboxed)
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor Give&Go iniciado correctamente.`);
    console.log(`👉 Backend API: http://localhost:${PORT}/api`);
    console.log(`👉 Frontend App: http://localhost:${PORT}`);
  });
}

// Helper para evitar problemas de tipos con static e imports dinámicos en ESM/CJS de esbuild
function expressStatic(p: string) {
  const express = require('express');
  return express.static(p);
}

startServer().catch(err => {
  console.error('❌ Error fatal al iniciar el servidor:', err);
});
