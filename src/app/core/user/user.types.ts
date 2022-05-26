export interface User {
  // @ User data
  userId?: number;
  username: string;
  email: string;
  emailVerified?: boolean;
}

export interface UserSignUp {
  username: string;
  email: string;
  password: string;
}

export interface UpdateUser {
  username: string;
  emaiL: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
