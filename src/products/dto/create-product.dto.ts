import { IsString, IsNumber, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    @Transform(({ value }) => value?.trim())
    name: string;

    @IsNumber()
    @IsNotEmpty()
    price: number;
}
