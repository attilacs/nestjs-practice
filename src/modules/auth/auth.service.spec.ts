import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entities/user.entity';
import { UserResponseDto } from '../user/dto/user-response.dto';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            comparePassword: jest.fn(),
            findByUsername: jest.fn(),
            findByUsernameWithPassword: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mockedToken'),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('validateUserByUsername', () => {
    it('should return null if user is not found', async () => {
      const username = 'testuser';
      jest.spyOn(userService, 'findByUsername').mockResolvedValue(null);
      const result = await authService.validateUserByUsername(username);
      expect(result).toBeNull();
    });

    it('should return user data without the password if user is found', async () => {
      const username = 'testuser';
      const userDto: UserResponseDto = { id: 1, username, isAdmin: false };
      jest.spyOn(userService, 'findByUsername').mockResolvedValue(userDto);
      expect(await authService.validateUserByUsername(username)).toEqual(
        userDto,
      );
    });
  });

  describe('validateUserWithPassword', () => {
    it('should return null if user is not found', async () => {
      const username = 'testuser';
      const password = '12435';
      jest
        .spyOn(userService, 'findByUsernameWithPassword')
        .mockResolvedValue(null);
      const result = await authService.validateUserWithPassword(
        username,
        password,
      );
      expect(result).toBeNull();
    });

    it('should return null if the password is incorrect', async () => {
      const username = 'testuser';
      const password = 'wrongpassword';
      const user = new User();
      user.username = username;
      user.password = 'hashedpassword';
      jest
        .spyOn(userService, 'findByUsernameWithPassword')
        .mockResolvedValue(null);
      jest.spyOn(userService, 'comparePassword').mockResolvedValue(false);
      const result = await authService.validateUserWithPassword(
        username,
        password,
      );
      expect(result).toBeNull();
    });

    it('should return the user without the password if the username and password are correct', async () => {
      const username = 'testuser';
      const password = 'testpassword';
      const user = new User();
      user.id = 1;
      user.username = username;
      user.password = 'hashedpassword';
      user.isAdmin = false;
      const expectedResult: UserResponseDto = {
        id: 1,
        username,
        isAdmin: false,
      };
      jest
        .spyOn(userService, 'findByUsernameWithPassword')
        .mockResolvedValue(user);
      jest.spyOn(userService, 'comparePassword').mockResolvedValue(true);
      const result = await authService.validateUserWithPassword(
        username,
        password,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('login', () => {
    it('should return a token when login is called', async () => {
      const username = 'testUser';
      const user: UserResponseDto = { id: 1, username, isAdmin: false }; // Mock user
      const result = await authService.login(user);
      expect(result).toEqual({ accessToken: 'mockedToken' });
      expect(jwtService.sign).toHaveBeenCalledWith({ username });
    });

    it('should generate a token with correct payload', async () => {
      const username = 'testUser';
      const user: UserResponseDto = { id: 1, username, isAdmin: false }; // Mock user
      const result = await authService.login(user);
      expect(result.accessToken).toBe('mockedToken');
      expect(jwtService.sign).toHaveBeenCalledWith({ username });
    });
  });
});
