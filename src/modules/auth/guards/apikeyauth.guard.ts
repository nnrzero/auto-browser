import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class ApiKeyAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<any> {
    const req = context.switchToHttp().getRequest();
    const apiKey = req.headers['api-key'];

    if (apiKey !== process.env.API_KEY) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
