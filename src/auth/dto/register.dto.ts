import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
} from 'class-validator';
import { Gender, UserStatus } from 'src/users/entity/user.entity';


export class CreateUserDto {
  @IsString()
  @MaxLength(20)
  employee_code!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatar?: string;

  @IsString()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  birthday?: Date;

  @IsOptional()
  @IsString()
  @Length(12, 12)
  identity_number?: string;

  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsOptional()
  @IsString()
  @Length(10, 15)
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  hire_date?: Date;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsString()
  @MaxLength(255)
  password!: string;

  @IsOptional()
  @IsUUID()
  department_id?: string;

  // @IsOptional()
  // @IsEnum(UserPosition)
  // position?: UserPosition;
}