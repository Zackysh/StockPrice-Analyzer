import { ExistsOnDb } from '@/types/generic.decorators';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { IsUsername, IsUsernameAvailable } from './user.decorators';

export class UpdateUserDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  public username: string;
  @IsString()
  @MinLength(6)
  @MaxLength(32)
  public password: string;
}

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  @ExistsOnDb(new IsUsernameAvailable())
  public username: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  public password: string;
}

export class SignInDTO {
  @IsString()
  @ExistsOnDb(new IsUsername())
  public username: string;

  @IsString()
  public password: string;
}
