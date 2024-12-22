
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../../enums/role.enum';
import { LogsService } from '../../log/log.service';


@Injectable()
export class authorizationGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private logsService: LogsService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
      const { user } = context.switchToHttp().getRequest();
      console.log(user);
      if(!user)
        throw new UnauthorizedException('no user attached');

      const userRole = user.role
      console.log('userRole', userRole);
      if (!requiredRoles.includes(userRole)){ //error log! this automatically logs the person that tried to acess the route!
        this.logsService.logError('Unauthorized access attempt: Insufficient role', {
          userId: user.id,
          role: user.role,
          requiredRoles,
        });
        throw new UnauthorizedException('unauthorized access');
      }
    return true;
  }
}