import { validationMiddleware } from '@/server/middlewares/validation.middleware';
import UserService from '@/server/services/user.service';
import { CreateUserDto, UpdateUserDto } from '@/types/core/user/user.dto';
import { User } from '@/types/core/user/user.types';
import {
  Authorized,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseBefore,
} from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';

@Controller('/api/user')
export class UserController {
  public userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Data Fetch
  // -----------------------------------------------------------------------------------------------------

  @Get('/:id')
  @Authorized({ resource: 'user', permission: 'read' })
  @OpenAPI({ summary: 'Find a user by ID' })
  async findById(@Param('id') idUser: number) {
    const response: User = await this.userService.findById(idUser);
    return response;
  }

  @Get()
  @Authorized({ resource: 'user', permission: 'read' })
  @OpenAPI({ summary: 'Get all users' })
  async findAll() {
    const response: User[] = await this.userService.findAll();
    return response;
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Data Manipulation
  // -----------------------------------------------------------------------------------------------------

  @Post()
  @HttpCode(201)
  @Authorized({ resource: 'user', permission: 'create' })
  @UseBefore(validationMiddleware(CreateUserDto, 'body'))
  @OpenAPI({ summary: 'Create a new user' })
  async create(@Body() userData: CreateUserDto) {
    const response = await this.userService.create(userData);
    return response;
  }

  @Put('/:id')
  @Authorized({ resource: 'user', permission: 'update' })
  @UseBefore(validationMiddleware(UpdateUserDto, 'body', true))
  @OpenAPI({ summary: 'Update a user' })
  async update(@Param('id') idUser: number, @Body() userData: UpdateUserDto) {
    const response: User = await this.userService.update(idUser, userData);
    return response;
  }

  @Delete('/:id')
  @Authorized({ resource: 'user', permission: 'delete' })
  @OpenAPI({ summary: 'Delete a user' })
  async delete(@Param('id') idUser: number) {
    const response: User = await this.userService.delete(idUser);
    return response;
  }
}
