import { IsEmail, IsNotEmpty, IsString, IsOptional, isEmail, MaxLength } from "class-validator";
import { Transform } from "class-transformer";
import { sanitizeInput } from "src/common/utils/sanitise"; // Import your sanitization utility

export class SignInDto {

    @IsNotEmpty()
    @IsEmail()
    @MaxLength(50, { message: "Email must not exceed 50 characters." }) // Restrict email length
    @Transform(({ value }) => sanitizeInput(value)) // Sanitize email to prevent script injection
    email:string

    @IsNotEmpty()
    @MaxLength(128, { message: "Password must not exceed 128 characters." }) // Restrict password length
    @Transform(({ value }) => sanitizeInput(value))
    password:string
  }