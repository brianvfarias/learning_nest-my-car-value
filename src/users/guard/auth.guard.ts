import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SessionsService } from '../sessions.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly sessionService: SessionsService) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    if (!request.session.mycv_session) return false;
    const { token, id } = request.session.mycv_session;
    const userIdSession = await this.sessionService.valideSession(token);
    console.log(userIdSession);
    if (!userIdSession || userIdSession !== parseInt(id))
      throw new UnauthorizedException(
        'We could not authenticate you. Login again and try again',
      );
    return id;
  }
}
