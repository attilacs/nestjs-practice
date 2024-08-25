import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { UserResponseDto } from '../user/dto/user-response.dto';
import { UserLoginDto } from './dto/user-login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            validateUserWithPassword: jest.fn(),
            login: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should throw UnauthorizedException if the user credentials are invalid', async () => {
      const userLoginDto: UserLoginDto = {
        username: 'testuser',
        password: 'testpass',
      };
      jest
        .spyOn(authService, 'validateUserWithPassword')
        .mockResolvedValue(null);
      await expect(controller.login(userLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.validateUserWithPassword).toHaveBeenCalledWith(
        userLoginDto.username,
        userLoginDto.password,
      );
    });

    it('should return an access token on successful login', async () => {
      const userLoginDto: UserLoginDto = {
        username: 'testuser',
        password: 'testpass',
      };
      const mockUser: UserResponseDto = {
        id: 1,
        username: 'testuser',
        isAdmin: false,
      };
      const mockAccessToken = 'mockAccessToken';
      jest
        .spyOn(authService, 'validateUserWithPassword')
        .mockResolvedValue(mockUser);
      jest
        .spyOn(authService, 'login')
        .mockResolvedValue({ accessToken: mockAccessToken });
      const result = await controller.login(userLoginDto);
      expect(result).toEqual({ accessToken: mockAccessToken });
      expect(authService.validateUserWithPassword).toHaveBeenCalledWith(
        userLoginDto.username,
        userLoginDto.password,
      );
      expect(authService.login).toHaveBeenCalledWith(mockUser);
    });
  });
});
