import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ListingDto } from './listing.dto';
import { CommentDto } from './comment.dto';
import { CreateTagDto } from './create-tag.dto';

export class CreateItemDto {
  @ApiProperty({
    description: 'The name of the item',
    example: 'item1',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The listing belonging to the item',
    type: ListingDto,
    example: {
      description: 'listing description',
      rating: 4.5,
    },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ListingDto)
  listing?: ListingDto;

  @ApiProperty({
    description: 'The comments associated with the item',
    type: [CommentDto],
    example: [
      { content: 'This is a comment' },
      { content: 'This is another comment' },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CommentDto)
  comments?: CommentDto[];

  @ApiProperty({
    description: 'An array of tags associated with the item',
    type: [CreateTagDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  tags?: CreateTagDto[];
}
