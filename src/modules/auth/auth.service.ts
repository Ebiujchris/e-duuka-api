import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const existingUser = await this.usersService.findByPhone(createUserDto.phone);
    
    if (existingUser) {
      return { user: existingUser, isNew: false, token: this.generateToken(existingUser) };
    }

    const newUser = await this.usersService.create(createUserDto);
    return { user: newUser, isNew: true, token: this.generateToken(newUser) };
  }

  async login(phone: string, password: string) {
    const user = await this.usersService.findByPhone(phone);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken(user);
    return { user, token };
  }

  private generateToken(user: any) {
    const payload = {
      sub: user.id,
      phone: user.phone,
      shopId: user.shopId,
    };
    return this.jwtService.sign(payload, {
      expiresIn: '7d',
      secret: process.env.JWT_SECRET || 'your-secret-key',
    });
  }
}