import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from './entities/item.entity';
import { Repository } from 'typeorm';
import { Listing } from './entities/listing.entity';
import { Comment } from './entities/comment.entity';

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
  ) {}

  async create(createItemDto: CreateItemDto): Promise<Item> {
    try {
      const record = this.itemRepository.create({
        ...createItemDto,
      });
      return await this.itemRepository.save(record);
    } catch {
      throw new InternalServerErrorException('Failed to create item');
    }
  }

  async update(id: number, updateItemDto: UpdateItemDto): Promise<Item> {
    const item = await this.itemRepository.preload({
      id,
      ...updateItemDto,
    });
    if (!item) {
      throw new NotFoundException(`Item with id ${id} not found`);
    }
    return await this.itemRepository.save(item);
  }

  async remove(id: number): Promise<void> {
    const item = await this.itemRepository.findOne({
      where: { id },
    });
    if (!item) {
      throw new NotFoundException(`Item with id ${id} not found`);
    }
    await this.itemRepository.remove(item);
  }
}
