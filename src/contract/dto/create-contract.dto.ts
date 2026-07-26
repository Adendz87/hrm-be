import { Transform } from 'class-transformer';
import {
    IsDate,
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
    MaxLength,
    Min,
} from 'class-validator';
import { ContractType } from '../entities/contract.entity';

export class CreateContractDto {

    @IsUUID()
    employee_id!: string;


    @IsString()
    @MaxLength(50)
    contract_number!: string;


    @IsString()
    @MaxLength(255)
    contract_name!: string;


    @IsEnum(ContractType)
    type!: ContractType;


    @Transform(({ value }) => Number(value))
    @IsNumber()
    @Min(0)
    salary!: number;


    @Transform(({ value }) => new Date(value))
    @IsDate()
    start_date!: Date;


    @Transform(({ value }) => new Date(value))
    @IsDate()
    end_date!: Date;


    @IsOptional()
    @Transform(({ value }) =>
        value ? new Date(value) : undefined,
    )
    @IsDate()
    signed_date?: Date;


    @IsOptional()
    @IsString()
    file_url?: string;


    @IsOptional()
    @IsString()
    note?: string;
}