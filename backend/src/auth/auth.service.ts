import { BadRequestException, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Injectable } from "@nestjs/common";
import { UserService } from "src/users/users.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcrypt';
import { RegisterRequestDto } from './dto/RegisterRequestDto';
import { ObjectId, Types } from 'mongoose';
import { runInNewContext } from 'vm';
import { CreateUserDto } from 'src/users/dtos/create-user.dto';





@Injectable()
export class AuthService{
    constructor(
        private usersService: UserService, //i assume it will be added
        private jwtService: JwtService,
    ) {}

    //methods
    //sign up:
    async register(user: RegisterRequestDto): Promise<string> { //takes dto and creates a new user
      try{
        const existingUser = await this.usersService.findByEmail(user.email);
        if (existingUser) {
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
        return 'registered successfully';

      } catch(error){
        console.error('Unexpected error during registration:', error);
        throw error;
      }
    }


    //login
    async signIn(email: string, password: string): Promise< {access_token:string,payload:any}> { //ask!!
      const user = await this.usersService.findByEmail(email); //return userDocument
      if (!user) {
          throw new NotFoundException('User not found');
        }
      console.log("password: ", user.passwordHash);
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        console.log( await bcrypt.compare(password, user.passwordHash))
      if (!isPasswordValid) {
          throw new UnauthorizedException('Invalid credentials');
        }

      const payload = { userid: user._id, role: user.role };

      return {
          access_token: await this.jwtService.signAsync(payload), //this creates a token for the user
          payload //payload has the userid and role which will be needed in the guards
      };
  }
}
