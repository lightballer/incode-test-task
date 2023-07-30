import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { HashService } from 'src/hash/hash.service';
import { Role } from 'src/common/role';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UsersService,
    private hashService: HashService
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findOne(email);
    const [storedPassword, salt] = user.password.split('|');
    const isValidUser = await this.hashService.comparePasswords(storedPassword, salt, password);
    if (isValidUser) return this.userService.findOne(email);
    return null;
  }

  private getRole(user: User): Role {
    if (user.isAdmin) return Role.Admin;
    if (user.isBoss) return Role.Boss;
    return Role.Regular;
  }

  async login(loginUserDto: LoginDto): Promise<{ access_token: string }> {
    const { email, password } = loginUserDto;
    const user = await this.validateUser(email, password);

    if (user) {
      const payload = {
        email: user.email,
        role: this.getRole(user),
        expirationDate: Math.floor(Date.now() / 1000) + 3600,
      };
      return {
        access_token: this.jwtService.sign(payload, {
          secret: process.env.JWT_SECRET,
        }),
      };
    }

    return null;
  }
}