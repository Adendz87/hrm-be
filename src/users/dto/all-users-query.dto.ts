import { IsEmail, IsOptional } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class AllUsersQueryDto {
    @ApiPropertyOptional({
        description: 'Lọc danh sách user theo email (optical)',
        example: 'tenant@example.com',
    })
    @IsEmail()
    @IsOptional()
    email?: string;
}