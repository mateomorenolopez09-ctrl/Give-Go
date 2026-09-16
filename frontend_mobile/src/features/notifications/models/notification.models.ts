export interface NotificationItem {
  id: number;
  titulo: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
  tipo: 'evento' | 'postulacion' | 'donacion' | 'sistema';
}
