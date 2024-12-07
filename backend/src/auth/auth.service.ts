import { BadRequestException, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Injectable } from "@nestjs/common";
import { UserService } from "src/users/users.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcrypt';
import { RegisterRequestDto } from './dto/RegisterRequestDto';
import { ObjectId, Types } from 'mongoose';
import { runInNewContext } from 'vm';
import { CreateUserDto } from 'src/users/dtos/create-user.dto';
import { LogsService } from 'src/log/log.service';
import * as validator from 'validator';



@Injectable()
export class AuthService{
    constructor(
        private usersService: UserService, //i assume it will be added
        private jwtService: JwtService,
        private logsService: LogsService, //automatic logging for all valid/invalid login/register events
    ) {}

    //methods
    //sign up:
    async register(user: RegisterRequestDto): Promise<string> { //takes dto and creates a new user
      try{
        const sanitizedEmail = validator.normalizeEmail(user.email); // Normalize email to lowercase
        const sanitizedName = validator.escape(user.name); // Escape unsafe characters
        const sanitizedPassword = validator.escape(user.password);

        const existingUser = await this.usersService.findByEmail(user.email);
        if (existingUser) {
          this.logsService.logError('Registration attempt failed: Email already exists', { email: user.email }); //error log!
          throw new ConflictException('email already exists');
        }
        // Transform RegisterRequestDto into CreateUserDto
        const createUserDto: CreateUserDto = {
          name: user.name, // Access instance properties of the DTO
          email: user.email,
          password: await bcrypt.hash(user.password, 10), // Hash the password
          role: user.role,
        };

        await this.usersService.createUser(createUserDto); //normal creation
        this.logsService.logInfo('User registered successfully', { email: user.email }); //info login! (everything is ok)
        return 'registered successfully';

      } catch(error){
        console.error('Unexpected error during registration:', error);
        throw error;
      }
    }


    //login
    async signIn(email: string, password: string): Promise< {access_token:string,payload:any}> { //ask!!
      const sanitizedEmail = validator.normalizeEmail(email); // Normalize email
      const sanitizedPassword = validator.escape(password); // Escape unsafe characters

      const user = await this.usersService.findByEmail(email); //return userDocument
      if (!user) {
          this.logsService.logError('Login attempt failed: User not found', { email }); //error log!
          throw new NotFoundException('User not found');
        }
      console.log("password: ", user.passwordHash);
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        console.log( await bcrypt.compare(password, user.passwordHash))
      if (!isPasswordValid) {
          this.logsService.logError('Login attempt failed: Invalid credentials', { email }); //error log!
          throw new UnauthorizedException('Invalid credentials');
        }

      this.logsService.logInfo('User logged in successfully', { email, userId: user._id }); //info log! (everything is ok)

      const payload = { userid: user._id, role: user.role };

      return {
          access_token: await this.jwtService.signAsync(payload), //this creates a token for the user
          payload //payload has the userid and role which will be needed in the guards
      };
  }
}
