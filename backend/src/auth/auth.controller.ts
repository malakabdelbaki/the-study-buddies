import { Body, Controller, HttpStatus, Post, HttpException, Res, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterRequestDto } from './dto/RegisterRequestDto';
import { SignInDto } from './dto/SignInDto';
import { Response, Request } from 'express';
import { LogsService } from 'src/log/log.service';

@Controller('auth')
export class AuthController {
    constructor(
      private authService: AuthService,
      private logsService: LogsService, //added log!
    ) {}

  @Post('login')
  async signIn(@Body() signInDto: SignInDto, @Res({ passthrough: true }) res) {
    try {
      const result = await this.authService.signIn(signInDto.email, signInDto.password);

      res.cookie('token', result.access_token, {
        httpOnly: true, // Prevents client-side JavaScript access
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        maxAge: 3600 * 1000, // Cookie expiration time in milliseconds (1hr)
      });
      // Return success response
      this.logsService.logInfo('User logged in successfully', { email: signInDto.email, userId: result.payload.userid, }); //all successful logins!! (log their uid & email)
      return {
        statusCode: HttpStatus.OK,
        message: 'Login successful',
        user: result.payload,
      };

    } catch (error) {
      this.logsService.logError('Login failed', { email: signInDto.email, reason: error.message }); //failed logins and why?, should we also record ip?
        console.log(error)
      // Handle specific errors
      if (error instanceof HttpException) {
        throw error; // Pass through known exceptions
      }

      // Handle other unexpected errors
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'An error occurred during login',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('register')
  async signup(@Body() registerRequestDto: RegisterRequestDto) {
    try {
      // Call the AuthService to handle registration
      const result = await this.authService.register(registerRequestDto);

      // Return a success response with HTTP 201 Created status
      return {
        statusCode: HttpStatus.CREATED,
        message: 'User registered successfully',
        data: result,
      };
    } catch (error) {
      // Handle specific errors, such as email already exists or validation errors
      if (error.status === 409) {
        throw new HttpException(
          {
            statusCode: HttpStatus.CONFLICT,
            message: 'User already exists',
          },
          HttpStatus.CONFLICT,
        );
      }

      // Catch any other errors and throw a generic internal server error
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'An error occurred during registration',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  
  @Post('logout')
  async logout(@Req() request: Request, @Res() res: Response): Promise<void> {
      // Extract the token from the request
      const token = request.cookies?.token || request.headers['authorization']?.split(' ')[1];
      console.log('token:', token);
      if (!token) {
          res.status(HttpStatus.BAD_REQUEST).send({ message: 'No token provided' });
          return;
      }

      // Blacklist the token (or clear client-side token)
      await this.authService.logout(token);

      // Clear the token cookie (if applicable)
      res.clearCookie('token', { httpOnly: true });
      
      res.send({ message: 'Logged out successfully' });
  }

}