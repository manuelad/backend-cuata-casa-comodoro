import { IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateDepartmentDto {
  @IsString()
  @MinLength(3)
  @Transform(({ value }) => value?.trim())
  name: string;
}
