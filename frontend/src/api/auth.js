import API from './axios';

export const registerUser = (data) => API.post('/auth/register', data);
export const verifyOtp = (data) => API.post('/otp/verify', data);
export const resendOtp = (data) => API.post('/otp/send', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const logoutUser = () => API.post('/auth/logout');
export const refreshToken = () => API.post('/auth/refresh');
export const forgotPassword =(data)=>API.post('/auth/forgot-password',data);
export const resetPassword = (data)=>API.post('/auth/reset-password',data);
export const updateProfile = (data, token) =>
  API.put('/auth/profile', data, { headers: { Authorization: `Bearer ${token}` } });

export const changePassword = (data, token) =>
  API.put('/auth/change-password', data, { headers: { Authorization: `Bearer ${token}` } });