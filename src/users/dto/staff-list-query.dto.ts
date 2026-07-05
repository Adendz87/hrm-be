import { IsEmail, IsOptional } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";

export class StaffListQueryDto {
    @ApiPropertyOptional({
        description: 'lọc theo email',
        example: 'staff@example.com',
    })
    @Transform(({ value }) => value === '' ? undefined : value)
    @IsOptional()
    email?: string;
}