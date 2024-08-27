import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class ListingDto {
  @ApiProperty({
    description: 'The unique identifier for the listing',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  id?: number;

  @ApiProperty({
    description: 'The description of the listing',
    example: 'listing description',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'The rating of the listing',
    example: 4.5,
  })
  @IsNumber()
  @IsOptional()
  rating?: number;
}
