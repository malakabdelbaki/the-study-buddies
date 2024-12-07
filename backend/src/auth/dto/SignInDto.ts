import { IsEmail, IsNotEmpty, IsString, IsOptional, isEmail } from "class-validator";
//import { sanitizeInput } from "src/common/utils/sanitize-input"; // Import your sanitization utility

export class SignInDto {

    @IsNotEmpty()
    @IsEmail()
    //@Transform(({ value }) => sanitizeInput(value)) // Sanitize email to prevent script injection
    email:string

    @IsNotEmpty()
    //@Transform(({ value }) => sanitizeInput(value))
    password:string
  }