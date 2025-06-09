import { Transform } from 'class-transformer';
import { IsString, IsNumber, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateEmployeeDto {
    @IsString()
    @IsNotEmpty()
    @Transform(({ value }) => value?.trim())
    name: string;

    @IsString()
    @IsNotEmpty()
    uid: string;

    @IsNumber()
    @IsNotEmpty()
    accountNumber: number;

    @IsNumber()
    @IsNotEmpty()
    monthlyBudget: number;

    @IsNumber()
    @IsNotEmpty()
    departmentId: number;
}
