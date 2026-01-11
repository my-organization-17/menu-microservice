import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { MenuCategoryWithItems } from 'src/generated-types/menu-category';
import type { MenuCategory } from 'prisma/generated-types/client';
import type { Language } from 'prisma/generated-types/enums';

@Injectable()
export class MenuCategoryService {
  constructor(private readonly prisma: PrismaService) {}
  protected readonly logger = new Logger(MenuCategoryService.name);

  async getFullMenuByLanguage(language: Language): Promise<MenuCategoryWithItems[]> {
    this.logger.log(`Fetching full menu for language: ${language}`);
    try {
      const categories_with_items = await this.prisma.menuCategory.findMany({
        where: { language },
        orderBy: { position: 'asc' },
        include: {
          menuItems: {
            orderBy: { position: 'asc' },
          },
        },
      });

      return categories_with_items;
    } catch (error) {
      this.logger.error(`Error fetching full menu: ${error instanceof Error ? error.message : error}`);
      throw error;
    }
  }

  async getMenuCategoriesByLanguage(language: Language): Promise<MenuCategory[]> {
    this.logger.log(`Fetching menu categories for language: ${language}`);
    try {
      const categories = await this.prisma.menuCategory.findMany({
        where: { language },
        orderBy: { position: 'asc' },
      });
      this.logger.log(`Fetched ${categories.length} categories`);
      return categories;
    } catch (error) {
      this.logger.error(`Error fetching menu categories: ${error instanceof Error ? error.message : error}`);
      throw error;
    }
  }
}
