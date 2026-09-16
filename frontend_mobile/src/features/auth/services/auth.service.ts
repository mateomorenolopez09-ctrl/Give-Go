import { apiClient } from '../../../services/api/apiClient';
import { LoginPayload, RegisterVolunteerPayload, RegisterBeneficiaryPayload, ForgotPasswordPayload } from '../models/auth.models';

export const authFeatureService = {
  async login(payload: LoginPayload) {
    const res = await apiClient.post('/users/login', payload);
    return res.data;
  },

  async registerVolunteer(payload: RegisterVolunteerPayload) {
    const res = await apiClient.post('/users/register', payload);
    return res.data;
  },

  async registerBeneficiary(payload: RegisterBeneficiaryPayload) {
    const res = await apiClient.post('/users/register', payload);
    return res.data;
  },

  async forgotPassword(payload: ForgotPasswordPayload) {
    const res = await apiClient.post('/users/forgot-password', payload);
    return res.data;
  },
};

export default authFeatureService;
