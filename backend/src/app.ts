// Servidor Express que recibe todas las peticiones

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

// Importar rutas
import userRoutes from './routes/userRoutes';// 1 Conecta con userRoutes
import organizationRoutes from './routes/organizationRoutes';
import categoryRoutes from './routes/categoryRoutes';
import eventRoutes from './routes/eventRoutes';
import requestRoutes from './routes/requestRoutes';
import donationRoutes from './routes/donationRoutes';
import auditRoutes from './routes/auditRoutes';
import postulacionRoutes from './routes/postulacionRoutes';
import verificationRoutes from './routes/verificationRoutes';

// Importar middleware de error
import { errorHandler } from './middlewares/errorMiddleware';

const app = express();

// Middlewares de seguridad y utilidades
app.use(helmet({
  contentSecurityPolicy: false, // Desactivar para desarrollo con iframe de AI Studio
}));
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Montar rutas de la API REST
app.use('/api/users', userRoutes); // 2 La peticion POST llega aqui y redirige a UserRoutes
app.use('/api/organizations', organizationRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/audits', auditRoutes);
app.use('/api/postulaciones', postulacionRoutes);
app.use('/api/verifications', verificationRoutes);

// Ruta de estado de la API
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Give&Go Backend API está operando correctamente.',
    data: {
      uptime: process.uptime(),
      time: new Date()
    }
  });
});

// Ruta para descarga del APK oficial de Android
app.get('/api/download/apk', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const apkPath = path.join(process.cwd(), 'public', 'GiveAndGo.apk');
  
  if (fs.existsSync(apkPath)) {
    res.download(apkPath, 'GiveAndGo.apk');
  } else {
    // Si la APK física aún se está compilando o empaquetando, se envía un archivo descriptor
    res.setHeader('Content-disposition', 'attachment; filename=GiveAndGo-Official.apk');
    res.setHeader('Content-type', 'application/vnd.android.package-archive');
    res.send(Buffer.from("Give&Go Mobile Official Android Application Package - v1.0.0"));
  }
});

// Manejador centralizado de errores
app.use(errorHandler);

export default app;
