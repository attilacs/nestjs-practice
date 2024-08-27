import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from 'src/app.module';
import { Repository } from 'typeorm';
import { ItemService } from './item.service';
import { CreateItemDto } from './dto/create-item.dto';
import { Item } from './entities/item.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from '../user/user.service';
import { UserResponseDto } from '../user/dto/user-response.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import * as request from 'supertest';

describe('ItemController (e2e)', () => {
  let app: INestApplication;
  let itemRepository: Repository<Item>;
  let itemService: ItemService;
  let createItemDto: CreateItemDto = { name: 'item1' };
  let createUserDto: CreateUserDto = {
    username: 'testUser1',
    password: 'testPassword1',
  };
  let userService: UserService;
  let testUser: UserResponseDto;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    itemRepository = moduleFixture.get<Repository<Item>>(
      getRepositoryToken(Item),
    );
    itemService = moduleFixture.get<ItemService>(ItemService);
    userService = moduleFixture.get<UserService>(UserService);

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
    await itemRepository.clear();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/items (POST)', () => {
    it('should create an item successfully and return it', async () => {
      const createItemDto: CreateItemDto = { name: 'createItemTest01' };
      const response = await request(app.getHttpServer())
        .post('/items')
        .set('Authorization', `Bearer ${authToken}`) // Set the Authorization header
        .send(createItemDto)
        .expect(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toEqual(
        expect.objectContaining({
          name: createItemDto.name,
        }),
      );
      const itemInDb = await itemRepository.findOneBy({
        name: createItemDto.name,
      });
      expect(itemInDb).toBeDefined();
    });

  });

});
