import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CommentDto {
  @ApiProperty({
    description: 'The unique identifier for the comment',
    example: 1,
    required: false,
  })
  id?: number;

  @ApiProperty({
    description: 'The content of the comment',
    example: 'This is a comment',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
