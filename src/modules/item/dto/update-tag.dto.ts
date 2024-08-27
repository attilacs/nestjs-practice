import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { CreateTagDto } from './create-tag.dto';

export class UpdateTagDto extends PartialType(CreateTagDto) {
  @ApiProperty({
    description: 'The content of the tag',
    example: 'Updated Content',
    required: false,
  })
  @IsString()
  @IsOptional()
  content?: string;
}
