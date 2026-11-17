import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateShopDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string | null;
}
