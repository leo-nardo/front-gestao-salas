export const authRoutes = {
  login: () => "/login",
  signUp: () => "/sign-up",
  firstAccess: () => "/first-access",
  forgotPassword: () => "/forgot-password",
  passwordChange: () => "/password-change",
  confirmEmail: () => "/confirm-email",
  confirmNewEmail: () => "/confirm-new-email",
};

export const profileRoutes = {
  view: () => "/profile",
  edit: () => "/profile/edit",
};

export const publicRoutes = {
  /** Raiz do app: decide entre login e a página inicial do perfil. */
  home: () => "/",
  privacyPolicy: () => "/privacy-policy",
};
