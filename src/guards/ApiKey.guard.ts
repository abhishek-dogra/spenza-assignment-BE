import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['whs-secret-key'];
    if (apiKey == null) {
      throw new HttpException(
        { message: `Invalid Auth Key.` },
        HttpStatus.UNAUTHORIZED,
      );
    }
    return true;
  }
}
