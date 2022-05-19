import authMiddleware from '@/server/middlewares/auth.middleware';
import { validationMiddleware } from '@/server/middlewares/validation.middleware';
import { AuthResponse } from '@/types/core/auth/auth.types';
import { SignInDTO } from '@/types/core/user/user.dto';

import { Authorized, Body, Controller, HeaderParam, Post, UseBefore } from 'routing-controllers';
import AuthService from '../services/auth.service';

@Controller('/api/user')
export class AuthController {
  private _authService: AuthService;

  constructor() {
    this._authService = new AuthService();
  }

  @Post('/sign-in')
  @UseBefore(validationMiddleware(SignInDTO, 'body'))
  async signIn(@Body() userData: SignInDTO) {
    const response: AuthResponse = await this._authService.signIn(userData);
    return response;
  }

  @Post('/refresh-token')
  async refreshAToken(@HeaderParam('x-refresh-token') refreshToken: string) {
    const response: AuthResponse = await this._authService.refreshAToken(refreshToken);

    return {
      accessToken: response.accessToken,
      refreshToken,
      user: response.user,
    };
  }

  @Post('/check-access')
  @UseBefore(authMiddleware)
  @Authorized()
  async checkAccess() {
    return { authorized: true };
  }
}
