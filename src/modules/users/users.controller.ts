import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getCurrentUser(@Req() req: any) {
    return this.usersService.findCurrentUser(req.user.userId ?? req.user.id);
  }

  @Patch('me/shop')
  @UseGuards(JwtAuthGuard)
  updateCurrentShop(@Body() updateShopDto: UpdateShopDto, @Req() req: any) {
    if (req.user.accountType && req.user.accountType !== 'owner') {
      throw new ForbiddenException('Only the shop owner can update shop details');
    }
    return this.usersService.updateShopForUser(
      req.user.userId ?? req.user.id,
      req.user.shopId,
      updateShopDto,
    );
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}