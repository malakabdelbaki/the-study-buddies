import { Role } from "src/enums/role.enum";
import { IsEmail, IsNotEmpty, IsString, IsOptional, IsEnum, Matches, Length} from "class-validator";
import { Transform } from "class-transformer";
import { IsEmailUnique } from "src/common/validators/is-email-unique.validator";

export class RegisterRequestDto {
   
  @IsString()
  @IsNotEmpty({ message: 'Name is required.' })
  @Length(2, 50, { message: "Name must be between 2 and 50 characters." })
  @Matches(/^[a-zA-Z\s]+$/, { message: "Name must contain only letters and spaces." })
  @Transform(({ value }) => value.trim()) // Trim leading/trailing whitespace
  name:string;

  @IsEmail()
  @IsNotEmpty({ message: 'Email is required.' })
  @Transform(({ value }) => value.trim().toLowerCase()) // Normalize email (so all lowercase)
  @IsEmailUnique({ message: 'This email is already in use.' })
  email: string;

  // Password validation: Minimum 8 characters, includes uppercase, lowercase, number, and special character
  @IsString()
  @IsNotEmpty({ message: 'Password is required.' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    { message: "Password must be at least 8 characters long, include one uppercase letter, one lowercase letter, one number, and one special character." })
  password: string;

  @IsEnum(Role)
  role: Role;
  }

