import { Test, TestingModule } from '@nestjs/testing';
import { ItemService } from './item.service';
import { Item } from './entities/item.entity';
import { DataSource, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateItemDto } from './dto/create-item.dto';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Listing } from './entities/listing.entity';
import { Comment } from './entities/comment.entity';

describe('ItemService', () => {
  let service: ItemService;
  let itemRepository: Repository<Item>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemService,
        {
          provide: getRepositoryToken(Item),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
            // createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ItemService>(ItemService);
    itemRepository = module.get<Repository<Item>>(getRepositoryToken(Item));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a user and return without password', async () => {
      const createItemDto: CreateItemDto = { name: 'item01' };
      const savedItem: Item = {
        id: 1,
        name: createItemDto.name,
        listing: null,
        comments: null,
        tags: null,
      };
      jest.spyOn(itemRepository, 'save').mockResolvedValue(savedItem);
      const result = await service.create(createItemDto);
      expect(result).toEqual(savedItem);
    });

    it('should throw InternalServerErrorException when save fails', async () => {
      const createItemDto: CreateItemDto = { name: 'item01' };
      jest
        .spyOn(itemRepository, 'save')
        .mockRejectedValue(new Error('Save failed'));
      await expect(service.create(createItemDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException if item not found', async () => {
      jest.spyOn(itemRepository, 'findOne').mockResolvedValue(null);
      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });

  });
});
