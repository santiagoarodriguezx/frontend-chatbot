import { authRepository } from "../data/auth.repository";

export const authService = {
  getSession: () => authRepository.getSession(),
  signInWithPassword: (email: string, password: string) =>
    authRepository.signInWithPassword(email, password),
  signUp: (email: string, password: string) =>
    authRepository.signUp(email, password),
  signInWithGoogle: (redirectTo: string) =>
    authRepository.signInWithGoogle(redirectTo),
  onAuthStateChange: (
    callback: Parameters<typeof authRepository.onAuthStateChange>[0],
  ) => authRepository.onAuthStateChange(callback),
  getUser: () => authRepository.getUser(),
};
