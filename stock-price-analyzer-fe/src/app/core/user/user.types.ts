export interface User {
  // @ User data
  userId?: number;
  username: string;
  email: string;
  isPremium?: boolean;
  emailVerified?: boolean;
}

export interface UpdateUser {
  username: string;
  emaiL: string;
}
