import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UserLoginDto {
  @ApiProperty({
    description: 'The username of the user',
    example: 'user123',
  })
  @IsString()
  @IsNotEmpty({ message: 'Username is required and cannot be empty.' })
  username: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required and cannot be empty.' })
  @ApiProperty({
    description: 'The password of the user',
    example: 'securepassword',
  })
  password: string;
}
