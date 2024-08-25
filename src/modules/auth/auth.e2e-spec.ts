import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserResponseDto } from '../user/dto/user-response.dto';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppModule } from 'src/app.module';
import { UserLoginDto } from './dto/user-login.dto';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let userService: UserService;
  let createUserDto: CreateUserDto = {
    username: 'testUser1',
    password: 'testPassword1',
  };
  let testUser: UserResponseDto;
  let authToken: string;

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
    testUser = await userService.create(createUserDto);
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: createUserDto.username,
        password: createUserDto.password,
      })
      .expect(201);
    authToken = loginResponse.body.accessToken;
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await userRepository.clear();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/login (POST)', () => {
    it('should get Unauthorized exception when using invalid credentials', async () => {
      const userLoginDto: UserLoginDto = {
        username: 'invalidUserName',
        password: 'invalidPassword',
      };
      await request(app.getHttpServer())
        .post('/auth/login')
        .send(userLoginDto)
        .expect({
          statusCode: 401,
          message: 'Invalid credentials',
          error: 'Unauthorized',
        });
    });

    it('should get the token when using valid credentials', async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: createUserDto.username,
          password: createUserDto.password,
        })
        .expect(201);
      const responseToken = loginResponse.body.accessToken;
      expect(responseToken).toBe(authToken);
    });
  });
});
