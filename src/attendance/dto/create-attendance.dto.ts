import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import {
  AttendanceStatus,
  AttendanceType,
} from '../entities/attendance.entity';

export class CreateAttendanceDto {
  @IsUUID()
  user_id!: string;

  @Type(() => Date)
  @IsDate()
  work_date!: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  check_in?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  check_out?: Date;

  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;

  @IsOptional()
  @IsEnum(AttendanceType)
  type?: AttendanceType;

  @IsOptional()
  @IsString()
  note?: string;
}