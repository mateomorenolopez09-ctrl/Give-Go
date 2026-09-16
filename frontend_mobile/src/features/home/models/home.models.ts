export interface HomeQuickAction {
  id: string;
  title: string;
  subtitle: string;
  iconName: string;
  color: string;
  route: string;
}

export interface HomeSummaryStats {
  voluntariosCount: number;
  eventosActivosCount: number;
  donacionesCount: number;
  beneficiariosImpactados: number;
}

export interface HomeEventPreview {
  id: string;
  nombre: string;
  fecha: string;
  categoria: string;
  organizacionNombre: string;
  vacantes: number;
  imagen?: string;
}
