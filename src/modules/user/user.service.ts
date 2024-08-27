import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { UserResponseDto } from './dto/user-response.dto';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private dataSource: DataSource,
  ) {}

  private readonly SALT_ROUNDS = 8;

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const { password, ...userData } = createUserDto;
    try {
      const hashedPassword = await this.hashPassword(password);
      const record = this.userRepository.create({
        ...userData,
        password: hashedPassword,
      });
      const savedRecord = await this.userRepository.save(record);
      const { password: _, ...response } = savedRecord;
      return response;
    } catch {
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async createMany(createUserDtos: CreateUserDto[]): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      for (const createUserDto of createUserDtos) {
        const hashedPassword = await this.hashPassword(createUserDto.password);
        const user = this.userRepository.create({
          username: createUserDto.username,
          password: hashedPassword,
        });
        await queryRunner.manager.save(user);
      }
      await queryRunner.commitTransaction();
    } catch {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async createMany2(createUserDtos: CreateUserDto[]): Promise<void> {
    try {
      await this.dataSource.transaction(async (manager) => {
        for (const createUserDto of createUserDtos) {
          const hashedPassword = await this.hashPassword(
            createUserDto.password,
          );
          const user = this.userRepository.create({
            username: createUserDto.username,
            password: hashedPassword,
          });
          await manager.save(user);
        }
      });
    } catch {
      throw new InternalServerErrorException('Transaction failed');
    }
  }

  async findAll(): Promise<UserResponseDto[]> {
    return await this.userRepository
      .createQueryBuilder('user')
      .select(this.getSelectedFields())
      .getMany();
  }

  async findOne(id: number): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    const { password: _, ...result } = user;
    return result;
  }

  async findByUsername(username: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      return null;
    }
    const { password: _, ...result } = user;
    return result;
  }

  async findByUsernameWithPassword(username: string): Promise<User> {
    return await this.userRepository.findOne({ where: { username } });
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const { password, ...dataToUpdate } = updateUserDto;
    const hashedPassword = await this.hashPassword(password);
    const record = await this.findOne(id);
    const updatedRecord = {
      ...record,
      ...dataToUpdate,
      password: hashedPassword,
    };
    const { password: _, ...result } =
      await this.userRepository.save(updatedRecord);
    return result;
  }

  async remove(id: number): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    await this.userRepository.remove(user);
  }

  async comparePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  private getSelectedFields(): string[] {
    return ['user.id', 'user.username', 'user.isAdmin'];
  }

  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, this.SALT_ROUNDS);
  }
}
