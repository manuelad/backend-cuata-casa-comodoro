import { IsString, IsNumber, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateEmployeeDto {
    @IsString()
    @IsNotEmpty()
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
