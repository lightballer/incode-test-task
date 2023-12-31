import {
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'src/common/role';
import jwtDecode from 'jwt-decode';
import { JwtPayload } from 'jsonwebtoken';
import { extractTokenFromRequest } from 'src/common/jwt-token.decorator';

@Injectable()
export class CustomAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const jwtAuthResult = await super.canActivate(context);
    if (!jwtAuthResult) return false;

    const requestedRoles = this.reflector.get<Role[]>(
      'roles',
      context.getHandler(),
    );

    const req = context.switchToHttp().getRequest();

    const token = extractTokenFromRequest(req);

    const { role } = jwtDecode<JwtPayload>(token);

    if (requestedRoles.includes(role)) return true;

    return false;
  }
}
