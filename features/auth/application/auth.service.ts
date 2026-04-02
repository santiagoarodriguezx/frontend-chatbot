import { authRepository } from "../data/auth.repository";

export const authService = {
  getSession: () => authRepository.getSession(),
  signOut: () => authRepository.signOut(),
  signInWithOtp: (email: string, emailRedirectTo?: string) =>
    authRepository.signInWithOtp(email, emailRedirectTo),
  verifyEmailOtp: (email: string, token: string) =>
    authRepository.verifyEmailOtp(email, token),
  signInWithPassword: (email: string, password: string) =>
    authRepository.signInWithPassword(email, password),
  signUp: (email: string, password: string) =>
    authRepository.signUp(email, password),
  signInWithGoogle: (redirectTo: string) =>
    authRepository.signInWithGoogle(redirectTo),
  requestPasswordReset: (email: string, redirectTo: string) =>
    authRepository.requestPasswordReset(email, redirectTo),
  verifyRecoveryCode: (email: string, token: string) =>
    authRepository.verifyRecoveryCode(email, token),
  updatePassword: (password: string) => authRepository.updatePassword(password),
  onAuthStateChange: (
    callback: Parameters<typeof authRepository.onAuthStateChange>[0],
  ) => authRepository.onAuthStateChange(callback),
  getUser: () => authRepository.getUser(),
};
