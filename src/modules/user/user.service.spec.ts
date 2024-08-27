import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { DataSource, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a user and return without password', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        password: 'password123',
      };
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const savedUser: User = {
        id: 1,
        username: createUserDto.username,
        password: hashedPassword,
        isAdmin: false,
      };
      jest
        .spyOn(service as any, 'hashPassword')
        .mockResolvedValue(hashedPassword);
      jest.spyOn(userRepository, 'save').mockResolvedValue(savedUser);
      const result = await service.create(createUserDto);
      expect(result).toHaveProperty('id', savedUser.id);
      expect(result).toHaveProperty('username', savedUser.username);
      expect(result).toHaveProperty('isAdmin', savedUser.isAdmin);
      expect(result).not.toHaveProperty('password');
    });

    it('should throw InternalServerErrorException when save fails', async () => {
      const createUserDto = { username: 'testuser', password: 'password123' };
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      jest
        .spyOn(service as any, 'hashPassword')
        .mockResolvedValue(hashedPassword);
      jest
        .spyOn(userRepository, 'save')
        .mockRejectedValue(new Error('Save failed'));
      await expect(service.create(createUserDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw InternalServerErrorException when hashPassword fails', async () => {
      const createUserDto = { username: 'testuser', password: 'password123' };
      jest
        .spyOn(service as any, 'hashPassword')
        .mockRejectedValue(new Error('Hash failed'));
      await expect(service.create(createUserDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of users without password field', async () => {
      const expectedResult = [
        { id: 1, username: 'user1', isAdmin: false },
        { id: 2, username: 'user2', isAdmin: true },
      ];
      jest.spyOn(userRepository, 'createQueryBuilder').mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(expectedResult),
      } as any);
      const result = await service.findAll();
      expect(Array.isArray(result)).toBe(true);
      for (const user of result) {
        expect(user).not.toHaveProperty('password');
      }
    });
  });

  describe('findOne', () => {
    it('should return a user without password', async () => {
      const id = 1;
      const user = {
        id,
        username: 'user1',
        password: 'password',
        isAdmin: false,
      };
      const expectedResult = { id, username: 'user1', isAdmin: false };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      const result = await service.findOne(id);
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByUsername', () => {
    it('should return null if user not found', async () => {
      const invalidUserName = 'invalid-user-name';
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      const result = await service.findByUsername(invalidUserName);
      expect(result).toBe(null);
    });

    it('should return a user without the password', async () => {
      const username = 'user1';
      const user = { id: 1, username, password: 'password', isAdmin: false };
      const expectedResult = { id: 1, username, isAdmin: false };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      const result = await service.findByUsername(username);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findByUsernameWithPassword', () => {
    it('should return null if user not found', async () => {
      const invalidUserName = 'invalid-user-name';
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      const result = await service.findByUsernameWithPassword(invalidUserName);
      expect(result).toBe(null);
    });

    it('should return a user', async () => {
      const username = 'user1';
      const user = { id: 1, username, password: 'password', isAdmin: false };
      const expectedResult = {
        id: 1,
        username,
        password: 'password',
        isAdmin: false,
      };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      const result = await service.findByUsernameWithPassword(username);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('should update the user and return it without the password', async () => {
      const id = 1;
      const updateUserDto = {
        username: 'newUsername',
        password: 'newPassword',
      };
      const existingUser = {
        id,
        username: 'oldUsername',
        password: 'oldPassword',
      } as User;
      const updatedUser = {
        id,
        username: 'newUsername',
        password: 'hashedNewPassword',
      } as User;
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(existingUser);
      jest
        .spyOn(service as any, 'hashPassword')
        .mockResolvedValue('hashedNewPassword');
      jest.spyOn(userRepository, 'save').mockResolvedValue(updatedUser);
      const result = await service.update(id, updateUserDto);
      expect(result).toEqual({ id, username: 'newUsername' });
      expect(result).not.toHaveProperty('password');
    });

    it('should throw NotFoundException if the user is not found', async () => {
      const id = 1;
      const updateUserDto = {
        username: 'newUsername',
        password: 'newPassword',
      };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      await expect(service.update(id, updateUserDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });

    it('should remove a user if found', async () => {
      const user = new User();
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(userRepository, 'remove').mockResolvedValue(undefined);
      await service.remove(1);
      expect(userRepository.remove).toHaveBeenCalledWith(user);
    });
  });

  describe('comparePassword', () => {
    it('should return true if the passwords match', async () => {
      const bcryptCompare = jest.fn().mockResolvedValue(true);
      const spy = ((bcrypt.compare as jest.Mock) = bcryptCompare);
      const result = await service.comparePassword(
        'plainPassword',
        'hashedPassword',
      );
      expect(result).toBe(true);
      expect(spy).toHaveBeenCalled();
    });

    it('should return false if the passwords do not match', async () => {
      const bcryptCompare = jest.fn().mockResolvedValue(false);
      const spy = ((bcrypt.compare as jest.Mock) = bcryptCompare);
      const result = await service.comparePassword(
        'plainPassword',
        'hashedPassword',
      );
      expect(result).toBe(false);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('getSelectedFields', () => {
    it('should return a non-empty array', () => {
      const result = (service as any).getSelectedFields();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return the correct fields', () => {
      const expectedFields = ['user.id', 'user.username', 'user.isAdmin'];
      const result = (service as any).getSelectedFields();
      expect(result).toEqual(expectedFields);
    });

    it('should not include the password field', () => {
      const result = (service as any).getSelectedFields();
      expect(result).not.toContain('user.password');
    });
  });
});
