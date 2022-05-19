import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/types/core/auth/auth.types';
import { validateToken } from '@/utils/util';
import { NextFunction, Response } from 'express';

async function authMiddleware(req: RequestWithUser, res: Response, next: NextFunction) {
  // @ Validate token
  const accessToken = req.headers['x-access-token'] as string;
  if (!accessToken) next(new HttpException(401, 'No token provided'));
  validateToken(accessToken, 'access', ['idUser']);
  next();
}

export default authMiddleware;
