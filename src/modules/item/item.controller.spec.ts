import { Test, TestingModule } from '@nestjs/testing';
import { ItemController } from './item.controller';
import { ItemService } from './item.service';
import { CreateItemDto } from './dto/create-item.dto';
import { Item } from './entities/item.entity';
import { NotFoundException } from '@nestjs/common';

describe('ItemController', () => {
  let controller: ItemController;
  let itemService: ItemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemController],
      providers: [
        {
          provide: ItemService,
          useValue: {
            create: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ItemController>(ItemController);
    itemService = module.get<ItemService>(ItemService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an item and return it', async () => {
      const createItemDto: CreateItemDto = { name: 'item01' };
      const expectedResult: Item = {
        id: 1,
        name: createItemDto.name,
        listing: null,
        comments: null,
        tags: null,
      };
      jest.spyOn(itemService, 'create').mockResolvedValue(expectedResult);
      const result = await controller.create(createItemDto);
      expect(itemService.create).toHaveBeenCalledWith(createItemDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should call userService.remove with correct id', async () => {
      const id = 1;
      jest.spyOn(itemService, 'remove').mockResolvedValue(undefined);
      await controller.remove(id);
      expect(itemService.remove).toHaveBeenCalledWith(id);
    });

    it('should handle NotFoundException from itemService.remove', async () => {
      const id = 1;
      jest
        .spyOn(itemService, 'remove')
        .mockRejectedValue(
          new NotFoundException(`User with id ${id} not found`),
        );
      await expect(controller.remove(id)).rejects.toThrow(NotFoundException);
    });
  });
});
