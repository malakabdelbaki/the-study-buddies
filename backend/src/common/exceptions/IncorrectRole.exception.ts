import { HttpException, HttpStatus } from '@nestjs/common';

export class IncorrectRoleException extends HttpException {
  constructor(role: string) {
    const message = `User does not have the required role: ${role}`;
    
    super(message, HttpStatus.FORBIDDEN);
  }
}
