import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({
    description: 'The content of the tag',
    example: 'Technology',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
