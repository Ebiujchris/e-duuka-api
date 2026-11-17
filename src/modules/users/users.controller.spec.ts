import { ForbiddenException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController shop details', () => {
  let controller: UsersController;
  const usersService = {
    updateShopForUser: jest.fn(),
  };

  beforeEach(async () => {
    usersService.updateShopForUser.mockReset();
    const module = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersService }],
    }).compile();
    controller = module.get(UsersController);
  });

  it('updates details for the authenticated owner shop', async () => {
    const shop = { id: 'shop-1', name: 'Updated Shop' };
    usersService.updateShopForUser.mockResolvedValue(shop);

    await expect(
      controller.updateCurrentShop(
        { name: 'Updated Shop' },
        { user: { userId: 'owner-1', shopId: 'shop-1', accountType: 'owner' } },
      ),
    ).resolves.toBe(shop);
    expect(usersService.updateShopForUser).toHaveBeenCalledWith(
      'owner-1',
      'shop-1',
      { name: 'Updated Shop' },
    );
  });

  it('rejects staff updates', () => {
    expect(() => controller.updateCurrentShop(
      { name: 'Updated Shop' },
      { user: { userId: 'staff-1', shopId: 'shop-1', accountType: 'staff' } },
    )).toThrow(ForbiddenException);
    expect(usersService.updateShopForUser).not.toHaveBeenCalled();
  });
});
