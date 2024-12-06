import { Role } from "src/enums/role.enum";
import { IsEmail, IsNotEmpty, IsString, IsOptional, IsEnum, Matches} from "class-validator";

export class RegisterRequestDto {
   
  @IsString()
  @IsNotEmpty()
  name:string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  // Password validation: Minimum 8 characters, includes uppercase, lowercase, number, and special character
  @IsString()
  @IsNotEmpty()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    { message: "Password must be at least 8 characters long, include one uppercase letter, one lowercase letter, one number, and one special character." }
  )
  password: string;

  @IsEnum(Role)
  role: Role;
  }

