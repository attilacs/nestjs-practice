import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateItemDto } from './create-item.dto';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ListingDto } from './listing.dto';
import { Type } from 'class-transformer';
import { CommentDto } from './comment.dto';
import { UpdateTagDto } from './update-tag.dto';
import { CreateTagDto } from './create-tag.dto';

export class UpdateItemDto extends PartialType(CreateItemDto) {
  @ApiProperty({
    description: 'The name of the item',
    example: 'item1',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'The listing belonging to the item',
    type: ListingDto,
    example: {
      id: 1,
      description: 'listing description',
      rating: 4.5,
    },
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ListingDto)
  listing?: ListingDto;

  @ApiProperty({
    description: 'The comments associated with the item',
    type: [CommentDto],
    example: [
      {
        id: 1,
        content: 'This is a comment',
      },
      {
        id: 2,
        content: 'This is another comment',
      },
    ],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CommentDto)
  comments?: CommentDto[];

  @ApiProperty({
    description: 'An array of tags associated with the item',
    type: [UpdateTagDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  tags?: CreateTagDto[];
}
