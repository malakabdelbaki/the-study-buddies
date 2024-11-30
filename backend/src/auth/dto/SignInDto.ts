import { IsEmail, IsNotEmpty, IsString, IsOptional, isEmail } from "class-validator";

export class SignInDto {

    @IsNotEmpty()
    @IsEmail()
    email:string

    @IsNotEmpty()
    password:string
  }