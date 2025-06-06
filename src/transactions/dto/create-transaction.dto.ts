import { IsNumber, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductTransactionDto {
    @IsNumber()
    @IsNotEmpty()
    productId: number;

    @IsNumber()
    @IsNotEmpty()
    count: number;
}

export class CreateTransactionDto {
    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    employeeId: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateProductTransactionDto)
    productTransactions: CreateProductTransactionDto[];
}
