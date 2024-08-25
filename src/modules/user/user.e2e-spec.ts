import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, NotFoundException } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
import { UserResponseDto } from './dto/user-response.dto';
import { User } from './entities/user.entity';
import { AppModule } from 'src/app.module';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let userService: UserService;
  const createUserDto: CreateUserDto = { username: 'user', password: '12345' };
  let createAdminDto: CreateUserDto = {
    username: 'admin',
    password: 'admin123',
    isAdmin: true,
  };
  let testUser: UserResponseDto;
  let testAdmin: UserResponseDto;
  let authTokenUser: string;
  let authTokenAdmin: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
    userService = moduleFixture.get<UserService>(UserService);
  });

  beforeEach(async () => {
    testAdmin = await userService.create(createAdminDto);
    const loginResponseAdmin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: createAdminDto.username,
        password: createAdminDto.password,
      })
      .expect(201);
    authTokenAdmin = loginResponseAdmin.body.accessToken;
    testUser = await userService.create(createUserDto);
    const loginResponseUser = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: createUserDto.username,
        password: createUserDto.password,
      })
      .expect(201);
    authTokenUser = loginResponseUser.body.accessToken;
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await userRepository.clear();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/users (POST)', () => {
    it('should create a user successfully and not return the password', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        password: 'password123',
        isAdmin: false,
      };
      const response = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${authTokenAdmin}`)
        .send(createUserDto)
        .expect(201);
      // Check if the password is not in the response
      expect(response.body).toEqual(
        expect.objectContaining({
          username: 'testuser',
          isAdmin: false,
        }),
      );
      expect(response.body).not.toHaveProperty('password');
      // Additionally, verify that the user is created in the database
      const userInDb = await userRepository.findOneBy({ username: 'testuser' });
      expect(userInDb).toBeDefined();
      expect(userInDb.password).not.toBe('password123'); // Ensure password is hashed
    });

    it('should return 500 when user creation fails', async () => {
      const createUserDto = {
        username: 'testuser',
        password: 'password123',
        isAdmin: false,
      };
      // Simulate a failure scenario, e.g., repository throwing an error
      jest.spyOn(userRepository, 'save').mockImplementation(() => {
        throw new Error('Database error');
      });
      const response = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${authTokenAdmin}`)
        .send(createUserDto)
        .expect(500);
      expect(response.body.message).toBe('Failed to create user');
    });
  });

  describe('/users (GET)', () => {
    it('should return 403 if user is not admin', async () => {
      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${authTokenUser}`) // Set the Authorization header
        .expect({
          statusCode: 403,
          message: 'Forbidden',
        });
    });

    it('should return all users without password field', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${authTokenAdmin}`);
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      for (const user of response.body) {
        expect(user).not.toHaveProperty('password');
      }
    });
  });

  describe('GET /users/:id', () => {
    it('should return a user without the password field', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${testUser.id}`)
        .set('Authorization', `Bearer ${authTokenAdmin}`)
        .expect(200);
      expect(response.body).toEqual({
        id: testUser.id,
        username: testUser.username,
        isAdmin: false,
      });
    });

    it('should return 404 if user not found', async () => {
      jest
        .spyOn(userRepository, 'findOne')
        .mockRejectedValue(new NotFoundException('User with id 999 not found'));
      await request(app.getHttpServer())
        .get('/users/999')
        .set('Authorization', `Bearer ${authTokenAdmin}`)
        .expect(404)
        .expect({
          statusCode: 404,
          message: 'User with id 999 not found',
          error: 'Not Found',
        });
    });
  });

  describe('PATCH /users/:id', () => {
    it('should update a user and return the updated data without password', async () => {
      const updateUserDto = {
        username: 'newUsername',
        password: 'newPassword',
      };
      // Seed data
      const createUserDto: CreateUserDto = {
        username: 'oldUsername',
        password: 'oldPassword',
        isAdmin: false,
      };
      const user = await userService.create(createUserDto);

      const response = await request(app.getHttpServer())
        .patch(`/users/${user.id}`)
        .set('Authorization', `Bearer ${authTokenAdmin}`)
        .send(updateUserDto)
        .expect(200);
      expect(response.body).toEqual({
        id: user.id,
        username: updateUserDto.username,
        isAdmin: false, // Preserve other fields
      });
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 404 if the user is not found', async () => {
      const nonExistentId = 999;
      await request(app.getHttpServer())
        .patch(`/users/${nonExistentId}`)
        .send({ username: 'anyUsername', password: 'anyPassword' })
        .set('Authorization', `Bearer ${authTokenAdmin}`)
        .expect(404);
    });
  });

  describe('/users/:id (DELETE)', () => {
    it('should delete a user and return no content', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        password: 'password',
      };
      const user = await userService.create(createUserDto);
      await request(app.getHttpServer())
        .delete(`/users/${user.id}`)
        .set('Authorization', `Bearer ${authTokenAdmin}`)
        .expect(204);
      const deletedUser = await userRepository.findOneBy({ id: user.id });
      expect(deletedUser).toBeNull();
    });

    it('should return 404 if user not found', async () => {
      await request(app.getHttpServer())
        .delete('/users/999')
        .set('Authorization', `Bearer ${authTokenAdmin}`)
        .expect(404);
    });
  });
});
