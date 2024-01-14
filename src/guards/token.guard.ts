import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization;
    if (token == null) {
      throw new HttpException(
        { message: `Invalid Token.` },
        HttpStatus.UNAUTHORIZED,
      );
    }
    try {
      this.jwtService.verify(token, {
        secret: this.configService.get<string>('TOKEN_SECRET'),
      });
    } catch (e) {
      throw new HttpException(
        { message: `Invalid Token.` },
        HttpStatus.UNAUTHORIZED,
      );
    }
    const tokenDecoded = this.jwtService.decode(request.headers.authorization);
    request.headers['user-id'] = tokenDecoded['userId'];
    return true;
  }
}
