import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { AttendanceStatus, AttendanceType } from '../entities/attendance.entity';

export class UpdateAttendanceDto {
  @IsOptional()
  @IsDateString()
  check_in?: Date;

  @IsOptional()
  @IsDateString()
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