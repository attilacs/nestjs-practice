import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import * as dotenv from 'dotenv';
import { NotFoundException } from '@nestjs/common';
import { UserResponseDto } from '../user/dto/user-response.dto';

beforeAll(() => {
  dotenv.config({ path: `env/${process.env.NODE_ENV}.env` });
});

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: AuthService,
          useValue: {
            validateUserByUsername: jest.fn(),
          },
        },
      ],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    authService = module.get<AuthService>(AuthService);
  });

  describe('validate', () => {
    it('should throw NotFoundException when validateUserByUsername returns null', async () => {
      const payload = { username: 'unknownuser', isAdmin: false };
      jest.spyOn(authService, 'validateUserByUsername').mockResolvedValue(null);
      await expect(jwtStrategy.validate(payload)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return user without the password when validateUser returns user', async () => {
      const payload = { username: 'testuser', isAdmin: false };
      const userResponseDto: UserResponseDto = {
        id: 1,
        username: 'testuser',
        isAdmin: false,
      };
      jest
        .spyOn(authService, 'validateUserByUsername')
        .mockResolvedValue(userResponseDto);
      const result = await jwtStrategy.validate(payload);
      expect(result).toEqual(userResponseDto);
    });
  });
});
