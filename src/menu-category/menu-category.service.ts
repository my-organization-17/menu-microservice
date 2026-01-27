import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { AppError } from 'src/utils/errors/app-error';

import type {
  ChangeMenuCategoryPositionRequest,
  CreateMenuCategoryRequest,
  MenuCategory,
  MenuCategoryWithItems,
  StatusResponse,
  UpdateMenuCategoryRequest,
} from 'src/generated-types/menu-category';
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
      if (categories_with_items.length === 0) {
        this.logger.warn(`No menu categories found for language: ${language}`);
        throw AppError.notFound('No menu categories found for the specified language');
      }

      return categories_with_items;
    } catch (error) {
      this.logger.error(`Error fetching full menu: ${error instanceof Error ? error.message : error}`);
      if (error instanceof AppError) throw error;
      throw AppError.internalServerError('Failed to fetch full menu');
    }
  }

  async getMenuCategoriesByLanguage(language: Language): Promise<MenuCategory[]> {
    this.logger.log(`Fetching menu categories for language: ${language}`);
    try {
      const categories = await this.prisma.menuCategory.findMany({
        where: { language },
        orderBy: { position: 'asc' },
      });
      return categories;
    } catch (error) {
      this.logger.error(`Error fetching menu categories: ${error instanceof Error ? error.message : error}`);
      throw AppError.internalServerError('Failed to fetch menu categories');
    }
  }

  async getMenuCategoryById(id: string): Promise<MenuCategory | null> {
    this.logger.log(`Fetching menu category by ID: ${id}`);
    try {
      const category = await this.prisma.menuCategory.findUnique({
        where: { id },
      });
      if (category) {
        this.logger.log(`Menu category found: ${category.title}`);
      } else {
        this.logger.log(`Menu category with ID ${id} not found`);
        throw AppError.notFound('Menu category not found');
      }
      return category;
    } catch (error) {
      this.logger.error(`Error fetching menu category by ID: ${error instanceof Error ? error.message : error}`);
      if (error instanceof AppError) throw error;
      throw AppError.internalServerError('Failed to fetch menu category by ID');
    }
  }

  async createMenuCategory(data: CreateMenuCategoryRequest): Promise<MenuCategory> {
    this.logger.log(`Creating new menu category: ${data.title}`);
    const existingCategories = await this.getMenuCategoriesByLanguage(data.language as Language);
    if (existingCategories.some((category) => category.title === data.title)) {
      this.logger.warn(`Menu category with title "${data.title}" already exists`);
      throw AppError.conflict(`Menu category with title "${data.title}" already exists`);
    }
    const lastPosition =
      existingCategories.length > 0 ? Math.max(...existingCategories.map((category) => category.position)) : 0;
    try {
      const newCategory = await this.prisma.menuCategory.create({
        data: {
          language: data.language as Language,
          title: data.title,
          description: data.description,
          ...(data.isAvailable !== undefined && data.isAvailable !== null && { isAvailable: data.isAvailable }),
          ...(data.imageUrl && { imageUrl: data.imageUrl }),
          position: lastPosition + 1,
        },
      });
      this.logger.log(`Menu category created with position: ${newCategory.position}`);
      return newCategory;
    } catch (error) {
      this.logger.error(`Error creating menu category: ${error instanceof Error ? error.message : error}`);
      if (error instanceof AppError) throw error;
      throw AppError.internalServerError('Failed to create menu category');
    }
  }

  async updateMenuCategory(data: UpdateMenuCategoryRequest): Promise<MenuCategory> {
    this.logger.log(`Updating menu category with title: ${data.title}`);
    try {
      const updatedCategory = await this.prisma.menuCategory.update({
        where: { id: data.id },
        data: {
          ...(data.language && { language: data.language as Language }),
          ...(data.title && { title: data.title }),
          ...(data.description && { description: data.description }),
          ...(data.isAvailable !== undefined && data.isAvailable !== null && { isAvailable: data.isAvailable }),
          ...(data.imageUrl && { imageUrl: data.imageUrl }),
        },
      });
      this.logger.log(`Menu category with title ${data.title} updated successfully`);
      return updatedCategory;
    } catch (error) {
      this.logger.error(`Error updating menu category: ${error instanceof Error ? error.message : error}`);
      throw AppError.internalServerError('Failed to update menu category');
    }
  }

  async changeMenuCategoryPosition(data: ChangeMenuCategoryPositionRequest): Promise<MenuCategory> {
    const { id, position } = data;
    this.logger.log(`Changing position of menu category with ID: ${id} to new position: ${position}`);
    try {
      const updatedCategory = await this.prisma.$transaction(async (prisma) => {
        const categoryToUpdate = await prisma.menuCategory.findUnique({ where: { id } });
        if (!categoryToUpdate) {
          this.logger.warn(`Menu category with ID ${id} not found`);
          throw AppError.notFound('Menu category not found');
        }

        const categories = await prisma.menuCategory.findMany({
          where: { language: categoryToUpdate.language },
          orderBy: { position: 'asc' },
        });

        const updatedCategories = categories.map((category) => {
          if (category.id === id) {
            return { ...category, position };
          }
          if (categoryToUpdate.position < position) {
            // Moving down
            if (category.position > categoryToUpdate.position && category.position <= position) {
              return { ...category, position: category.position - 1 };
            }
          } else if (categoryToUpdate.position > position) {
            // Moving up
            if (category.position < categoryToUpdate.position && category.position >= position) {
              return { ...category, position: category.position + 1 };
            }
          }
          return category;
        });

        await Promise.all(
          updatedCategories.map((category) =>
            prisma.menuCategory.update({
              where: { id: category.id },
              data: { position: category.position },
            }),
          ),
        );

        return prisma.menuCategory.findUnique({ where: { id } }) as Promise<MenuCategory>;
      });

      this.logger.log(`Menu category position updated successfully to ${position}`);
      return updatedCategory;
    } catch (error) {
      this.logger.error(`Error changing menu category position: ${error instanceof Error ? error.message : error}`);
      if (error instanceof AppError) throw error;
      throw AppError.internalServerError('Failed to change menu category position');
    }
  }

  async deleteMenuCategory(id: string): Promise<StatusResponse> {
    this.logger.log(`Deleting menu category with ID: ${id}`);
    try {
      await this.prisma.menuCategory.delete({
        where: { id },
      });
      this.logger.log(`Menu category with ID ${id} deleted successfully`);
      return { success: true, message: 'Menu category deleted successfully' };
    } catch (error) {
      this.logger.error(`Error deleting menu category: ${error instanceof Error ? error.message : error}`);
      throw AppError.internalServerError('Failed to delete menu category');
    }
  }
}
