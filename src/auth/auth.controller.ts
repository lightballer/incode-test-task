import {
  Controller,
  Body,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/login')
  async login(@Body() loginDto: LoginDto) {
    const loginResult = await this.authService.login(loginDto);
    if (loginResult) return { access_token: loginResult.access_token };
    throw new UnauthorizedException();
  }
}