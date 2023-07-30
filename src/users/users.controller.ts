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
import { AuthGuard } from '@nestjs/passport';

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
    @Req() req: Request,
  ) {
    const token = req.headers['authorization'].split('Bearer ')[1];
    const payload = jwtDecode<JwtPayload>(token);
    const updatedUser = await this.usersService.update(
      +id,
      +payload.id,
      updateUserDto,
    );
    if (!updatedUser) throw new BadRequestException('Incorrect input');
    return updatedUser;
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
