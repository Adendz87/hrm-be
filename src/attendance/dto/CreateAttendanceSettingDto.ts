import { IsInt, IsString, Matches, Max, Min } from 'class-validator';

export class CreateAttendanceSettingDto {
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  start_time!: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  end_time!: string;

  @IsInt()
  @Min(0)
  @Max(120)
  late_after!: number;

  @IsInt()
  @Min(1)
  @Max(24)
  work_hours!: number;
}