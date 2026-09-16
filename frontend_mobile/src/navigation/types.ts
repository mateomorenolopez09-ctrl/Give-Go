export type RootStackParamList = {
  Auth: undefined;
  MainTabs: undefined;
  EventDetail: { eventId: number };
  CreateEvent: undefined;
  EditEvent: { event: any };
  CreateDonation: undefined;
  CreateRequest: undefined;
  EditProfile: { profile: any };
};

export type AuthStackParamList = {
  Login: undefined;
  RegisterVolunteer: undefined;
  RegisterBeneficiary: undefined;
  ForgotPassword: undefined;
};

export type BottomTabParamList = {
  Inicio: undefined;
  Eventos: undefined;
  Donaciones: undefined;
  Solicitudes: undefined;
  Notificaciones: undefined;
  Perfil: undefined;
};
