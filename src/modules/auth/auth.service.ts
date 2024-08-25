import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtPayload } from './jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { UserResponseDto } from '../user/dto/user-response.dto';

// TODO: implement logout function
// TODO: implement refresh tokens
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUserByUsername(username: string) {
    return await this.userService.findByUsername(username);
  }

  async validateUserWithPassword(
    username: string,
    password: string,
  ): Promise<UserResponseDto> {
    const user = await this.userService.findByUsernameWithPassword(username);
    if (!user) {
      return null;
    }
    if (
      user &&
      (await this.userService.comparePassword(password, user.password))
    ) {
      const { password: _, ...result } = user;
      return result;
    }
  }

  async login(user: UserResponseDto): Promise<{ accessToken: string }> {
    const payload: JwtPayload = { username: user.username };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }
}
