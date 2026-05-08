import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../../entities/user.entity';
import { Shop } from '../../entities/shop.entity';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Shop)
    private shopRepository: Repository<Shop>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { phone: createUserDto.phone },
    });

    if (existingUser) {
      throw new BadRequestException('User with this phone number already exists');
    }

    let shopId = createUserDto.shopId;

    // If shopId not provided, create a new shop
    if (!shopId && createUserDto.shopName) {
      const shop = this.shopRepository.create({
        name: createUserDto.shopName,
        location: createUserDto.shopLocation || 'Not specified',
        initialCapital: createUserDto.shopInitialCapital || 0,
      });
      const savedShop = await this.shopRepository.save(shop);
      shopId = savedShop.id;
    } else if (!shopId) {
      throw new BadRequestException('Either shopId or shopName is required');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.userRepository.create({
      phone: createUserDto.phone,
      name: createUserDto.name,
      password: hashedPassword,
      email: createUserDto.email,
      shopId,
    });

    return await this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find({
      relations: ['shop', 'products', 'sales', 'credits'],
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['shop', 'products', 'sales', 'credits'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByPhone(phone: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { phone },
      relations: ['shop', 'products', 'sales', 'credits'],
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    await this.userRepository.update(id, updateUserDto);
    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async updateResetCode(id: string, resetCode: string, resetCodeExpiry: Date): Promise<void> {
    await this.userRepository.update(id, { resetCode, resetCodeExpiry });
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    await this.userRepository.update(id, { 
      password: hashedPassword,
      resetCode: null,
      resetCodeExpiry: null
    });
  }
}