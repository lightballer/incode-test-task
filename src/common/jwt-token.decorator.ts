import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const JwtToken = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const token = extractTokenFromRequest(request);
    return token;
  },
);

export const extractTokenFromRequest = (req) =>
  req.headers.authorization?.split('Bearer ')[1];
