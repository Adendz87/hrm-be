import {
    IsString,
    IsBoolean,
    IsOptional,
    IsNotEmpty,
} from 'class-validator';

export class CreateRoleDto {
    @IsString()
    @IsNotEmpty()
    code!: string;

    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsOptional()
    @IsString()
    description!: string | null;

    @IsBoolean()
    is_active!: boolean;
}