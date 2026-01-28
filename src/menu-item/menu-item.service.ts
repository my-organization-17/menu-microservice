import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { AppError } from 'src/utils/errors/app-error';

import type { MenuItem, MenuItemList } from 'src/generated-types/menu-item';

@Injectable()
export class MenuItemService {
  constructor(private readonly prisma: PrismaService) {}
  protected readonly logger = new Logger(MenuItemService.name);

  async getMenuItemById(id: string): Promise<MenuItem> {
    this.logger.log(`Fetching menu item by id: ${id}`);
    try {
      const menuItem = await this.prisma.menuItem.findUnique({
        where: { id },
      });

      if (!menuItem) {
        this.logger.warn(`Menu item with id ${id} not found`);
        throw AppError.notFound(`Menu item with id ${id} not found`);
      }

      return menuItem;
    } catch (error) {
      this.logger.error(`Failed to get menu item by id: ${id}`, error instanceof Error ? error.message : error);
      if (error instanceof AppError) throw error;
      throw AppError.internalServerError('Failed to fetch full menu');
    }
  }

  async getMenuItemsByCategoryId(categoryId: string): Promise<MenuItemList> {
    this.logger.log(`Fetching menu items by category id: ${categoryId}`);
    try {
      const menuItems = await this.prisma.menuItem.findMany({
        where: { categoryId },
      });

      return { menuItems };
    } catch (error) {
      this.logger.error(
        `Failed to get menu items by category id: ${categoryId}`,
        error instanceof Error ? error.message : error,
      );
      throw AppError.internalServerError('Failed to fetch menu items by category');
    }
  }
}
