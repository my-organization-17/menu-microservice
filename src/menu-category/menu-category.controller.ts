import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { MenuCategoryService } from './menu-category.service';
import {
  MENU_CATEGORY_SERVICE_NAME,
  MenuCategoryList,
  MenuCategoryListWithItems,
} from 'src/generated-types/menu-category';
import type { Language } from 'prisma/generated-types/enums';

@Controller()
export class MenuCategoryController {
  constructor(private readonly menuCategoryService: MenuCategoryService) {}

  protected readonly logger = new Logger(MenuCategoryController.name);

  @GrpcMethod(MENU_CATEGORY_SERVICE_NAME, 'GetFullMenuByLanguage')
  async getFullMenuByLanguage({ language }: { language: Language }): Promise<MenuCategoryListWithItems> {
    this.logger.log(`Received request for full menu with language: ${language}`);
    const data = await this.menuCategoryService.getFullMenuByLanguage(language);
    this.logger.log(`Returning full menu with ${data.length} categories for language: ${language}`);
    return { data };
  }

  @GrpcMethod(MENU_CATEGORY_SERVICE_NAME, 'GetMenuCategoriesByLanguage')
  async getMenuCategoriesByLanguage({ language }: { language: Language }): Promise<MenuCategoryList> {
    this.logger.log(`Received request for menu categories with language: ${language}`);
    const data = await this.menuCategoryService.getMenuCategoriesByLanguage(language);
    this.logger.log(`Returning ${data.length} categories for language: ${language}`);
    return { data };
  }
}
