import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user and return the response without password', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        password: 'password123',
        isAdmin: false,
      };
      const userResponseDto: UserResponseDto = {
        id: 1,
        username: 'testuser',
        isAdmin: false,
      };
      jest.spyOn(userService, 'create').mockResolvedValue(userResponseDto);
      const result = await controller.create(createUserDto);
      expect(result).toEqual(userResponseDto);
      expect(userService.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should handle errors thrown by userService.create', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        password: 'password123',
        isAdmin: false,
      };
      jest
        .spyOn(userService, 'create')
        .mockRejectedValue(
          new InternalServerErrorException('Failed to create item'),
        );
      await expect(controller.create(createUserDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findAll', () => {
    it('should call userService.findAll', async () => {
      const findAllSpy = jest
        .spyOn(userService, 'findAll')
        .mockResolvedValue([] as any);
      await controller.findAll();
      expect(findAllSpy).toHaveBeenCalled();
    });

    it('should return an array of users without password field', async () => {
      const userData = [
        { id: 1, username: 'user1', isAdmin: false },
        { id: 2, username: 'user2', isAdmin: true },
      ];
      jest.spyOn(userService, 'findAll').mockResolvedValue(userData as any);
      const result = await controller.findAll();
      expect(Array.isArray(result)).toBe(true);
      for (const user of result) {
        expect(user).not.toHaveProperty('password');
      }
    });
  });

  describe('findOne', () => {
    it('should return a user without the password field', async () => {
      const serviceResult = { id: 1, username: 'user1', isAdmin: false };
      jest.spyOn(userService, 'findOne').mockResolvedValue(serviceResult);
      const result = await controller.findOne(1);
      expect(result).toEqual(serviceResult);
    });

    it('should throw NotFoundException if user not found', async () => {
      jest
        .spyOn(userService, 'findOne')
        .mockRejectedValue(new NotFoundException('User with id 1 not found'));
      await expect(controller.findOne(1)).rejects.toThrow(
        new NotFoundException('User with id 1 not found'),
      );
    });
  });

  describe('update', () => {
    it('should update the user and return the updated data', async () => {
      const id = 1;
      const updateUserDto: UpdateUserDto = {
        username: 'newUsername',
        password: 'newPassword',
      };
      const result = { id, username: 'newUsername', isAdmin: false };
      jest.spyOn(userService, 'update').mockResolvedValue(result);
      expect(await controller.update(id, updateUserDto)).toEqual(result);
    });

    it('should throw NotFoundException if the user is not found', async () => {
      const id = 1;
      const updateUserDto: UpdateUserDto = {
        username: 'newUsername',
        password: 'newPassword',
      };
      jest
        .spyOn(userService, 'update')
        .mockRejectedValue(
          new NotFoundException(`User with id ${id} not found`),
        );
      await expect(controller.update(id, updateUserDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should call userService.remove with correct id', async () => {
      const id = 1;
      jest.spyOn(userService, 'remove').mockResolvedValue(undefined);
      await controller.remove(id);
      expect(userService.remove).toHaveBeenCalledWith(id);
    });

    it('should handle NotFoundException from userService.remove', async () => {
      const id = 1;
      jest
        .spyOn(userService, 'remove')
        .mockRejectedValue(
          new NotFoundException(`User with id ${id} not found`),
        );
      await expect(controller.remove(id)).rejects.toThrow(NotFoundException);
    });
  });
});
