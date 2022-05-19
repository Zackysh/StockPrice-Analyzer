import { authConfig } from '@/configs/auth';
import { HttpException } from '@/exceptions/HttpException';
import { UserModel } from '@/server/models/user.model';
import { AuthResponse, TokenPayload } from '@/types/core/auth/auth.types';
import { SignInDTO } from '@/types/core/user/user.dto';
import { User } from '@/types/core/user/user.types';
import { signUserToken, validateToken } from '@/utils/util';

import bcrypt from 'bcrypt';

export default class AuthService {
  userModel: UserModel;

  constructor() {
    this.userModel = new UserModel();
  }

  public async signIn(userData: SignInDTO): Promise<AuthResponse> {
    // @ Process response
    const user = await this.userModel.findByUsername(userData.username);

    // check if password is valid
    if (!bcrypt.compareSync(userData.password, user.password))
      throw new HttpException(401, `Wrong password`);

    // @ sign access token
    const accessToken = signUserToken(user, 900, authConfig.accessSecret); // should be 900
    // @ sign refresh token
    const refreshToken = signUserToken(user, 604800, authConfig.refreshSecret);

    delete user.password;
    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  public async refreshAToken(refreshToken: string): Promise<AuthResponse> {
    // Verify token
    const decoded: TokenPayload = validateToken(refreshToken, 'refresh', ['idUser']);
    // Find user that owns this refresh token
    const user: User = await this.userModel.findById(decoded.idUser);
    // If user doesn't exist
    if (!user) throw new HttpException(401, `Invalid refresh token`);
    // Provide new accessToken
    const token = signUserToken(user, 604800, authConfig.accessSecret); // should be 900;

    delete user.password;
    return {
      accessToken: token,
      refreshToken: '',
      user,
    };
  }
}
