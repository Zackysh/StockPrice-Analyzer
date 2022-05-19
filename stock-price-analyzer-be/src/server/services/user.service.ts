import { authConfig } from '@/configs/auth';
import { HttpException } from '@/exceptions/HttpException';
import { UserModel } from '@/server/models/user.model';
import { UpdateUserDto } from '@/types/core/user/user.dto';
import { User } from '@/types/core/user/user.types';

import { signUserToken } from '@/utils/util';
import bcrypt from 'bcrypt';

export default class UserService {
  userModel: UserModel;

  constructor() {
    this.userModel = new UserModel();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Data Fetch
  // -----------------------------------------------------------------------------------------------------

  public async findAll(): Promise<User[]> {
    return await this.userModel.findAll();
  }

  public async findById(idUser: number): Promise<User> {
    const user = await this.userModel.findById(idUser);
    if (!user) throw new HttpException(404, `User not found with ID: ${idUser}`);
    return user;
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Data Manipulation
  // -----------------------------------------------------------------------------------------------------

  public async update(idUser: number, userData: UpdateUserDto): Promise<User> {
    // @ Validation
    const user = await this.userModel.findById(idUser);
    if (!user) throw new HttpException(404, 'User not found ');

    if (
      user.username &&
      user.username != userData.username &&
      (await this.userModel.findByUsername(user.username))
    ) {
      throw new HttpException(409, 'Username not available');
    }

    // @ Response
    // replace with hashed password
    userData.password = bcrypt.hashSync(userData.password, 8);
    await this.userModel.update(idUser, userData);
    return await this.userModel.findById(idUser);
  }

  public async create(
    userData: User,
  ): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    // replace with hashed password
    userData.password = bcrypt.hashSync(userData.password, 8);
    // Create user ...
    const userId = await this.userModel.create(userData);
    const user = await this.findById(userId);
    // Sign access and resfresh tokens
    const accessToken = signUserToken(user, 604800, authConfig.accessSecret);
    const refreshToken = signUserToken(user, 604800, authConfig.refreshSecret);

    delete user.password;
    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  public async delete(idUser: number): Promise<User> {
    // @ Validation
    const user = await this.userModel.findById(idUser);
    if (!user) throw new HttpException(404, 'User not found ');

    // @ Response
    await this.userModel.delete(idUser);
    return user;
  }
}
