import {
  Controller,
  Post,
  Body,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  signup(@Body() createAuthDto: CreateAuthDto) {
    const { email, password } = createAuthDto;
    console.log({ email, password });
    return this.authService.create(createAuthDto);
  }

  @Post('/login')
  login(@Body() createAuthDto: CreateAuthDto) {
    const { email, password } = createAuthDto;
    console.log({ email, password });
    return this.authService.create(createAuthDto);
  }
}
