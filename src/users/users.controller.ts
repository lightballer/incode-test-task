import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from 'src/common/roles.decorator';
import { CustomAuthGuard } from 'src/auth/auth.guard';
import { Role } from 'src/common/role';
import jwtDecode from 'jwt-decode';
import { JwtPayload } from 'jsonwebtoken';
import { JwtToken } from 'src/common/jwt-token.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const existingUser = await this.usersService.findOne(createUserDto.email);
    if (existingUser)
      throw new BadRequestException('User with such email already exists');
    const createdUser = await this.usersService.create(createUserDto);
    return { ...createdUser, password: undefined };
  }

  @Get()
  @UseGuards(CustomAuthGuard)
  @Roles(Role.Admin, Role.Boss, Role.Regular)
  findAll(@JwtToken() token: string) {
    const { email, role } = jwtDecode<JwtPayload>(token);
    const handler = this.getUsersHandlers({ email })[role];
    if (handler) return handler();
    throw new BadRequestException();
  }

  @Patch(':id')
  @UseGuards(CustomAuthGuard)
  @Roles(Role.Admin, Role.Boss)
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @JwtToken() token: string,
  ) {
    const payload = jwtDecode<JwtPayload>(token);
    return this.usersService.update(+id, +payload.id, updateUserDto);
  }

  private getUsersHandlers(options) {
    return {
      [Role.Admin]: () => this.usersService.findAll(),
      [Role.Boss]: async () => {
        const boss = await this.usersService.findOne(options.email);
        const subordinates = await this.usersService.getSubordinates(boss.id);
        return [{ ...boss, password: undefined }, ...subordinates];
      },
      [Role.Regular]: () => this.usersService.findOne(options.email),
    };
  }
}
