/* eslint-disable @typescript-eslint/no-unused-vars */
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { HttpException } from '@/exceptions/HttpException';
import { UserModel } from '@/server/models/user.model';
const userModel = new UserModel();

// -----------------------------------------------------------------------------------------------------
// @ Constraints
// -----------------------------------------------------------------------------------------------------

/**
 * Find user with provided idUser.
 * @throws 404 if doesn't exists
 * @return true if exists
 */
@ValidatorConstraint({ async: true })
export class IsUsername implements ValidatorConstraintInterface {
  async validate(username: string, args: ValidationArguments) {
    if (!username) return true;
    const resource = await userModel.findByUsername(username);
    if (!resource) throw new HttpException(404, `Couldn't find user with provided username`);
    return true;
  }
}

@ValidatorConstraint({ async: true })
export class IsUser implements ValidatorConstraintInterface {
  async validate(idUser: number, args: ValidationArguments) {
    if (!idUser) return true;
    const resource = await userModel.findById(idUser);
    if (!resource) throw new HttpException(404, `Couldn't find user with provided ID`);
    return true;
  }
}

@ValidatorConstraint({ async: true })
export class IsUsernameAvailable implements ValidatorConstraintInterface {
  async validate(username: string, args: ValidationArguments) {
    if (!username) return true;
    const resource = await userModel.findByUsername(username);
    if (resource) throw new HttpException(409, `Provided username isn't available`);
    return true;
  }
}
