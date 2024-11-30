import { Role } from "src/enums/role.enum";
import { IsEmail, IsNotEmpty, IsString, IsOptional, IsEnum} from "class-validator";

export class RegisterRequestDto {
   
  @IsString()
  name:string;

  //@IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsEnum(Role)
  role: Role;
  }

//an option to remove/update pfp...