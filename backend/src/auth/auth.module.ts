import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
import { WsJwtGuard } from 'src/WebSockets/guards/ws-jwt-authentication.guard';
import { LogsModule } from 'src/log/log.module';
dotenv.config();
import { UserService } from 'src/users/users.service';
import { IsEmailUniqueConstraint } from 'src/common/validators/is-email-unique.validator';

@Module({
  controllers: [AuthController],
  providers: [AuthService, WsJwtGuard, IsEmailUniqueConstraint],
  imports:[
    UserModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
    }),
    LogsModule,
    UserModule,
  ],//export if we'll use one of the services outside.
  exports:[WsJwtGuard, AuthService, IsEmailUniqueConstraint]
})
export class AuthModule {}