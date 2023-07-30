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
import { Request } from 'express';
import jwtDecode from 'jwt-decode';
import { JwtPayload } from 'jsonwebtoken';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(CustomAuthGuard)
  @Roles(Role.Admin, Role.Boss, Role.Regular)
  findAll(@Req() req: Request) {
    const token = req.headers['authorization'].split('Bearer ')[1];
    const { email, role } = jwtDecode<JwtPayload>(token);
    const getUsersHandlers = (options) => ({
      [Role.Admin]: () => this.usersService.findAll(),
      [Role.Boss]: async () => {
        const boss = await this.usersService.findOne(email);
        const subordinates = await this.usersService.getSubordinates(boss.id);
        return [boss, ...subordinates];
      },
      [Role.Regular]: () => this.usersService.findOne(options.email),
    });
    const handler = getUsersHandlers({ email })[role];
    if (handler) return handler();
    throw new BadRequestException();
  }

  @Patch(':id')
  @UseGuards(CustomAuthGuard)
  @Roles(Role.Admin, Role.Boss)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }
}
