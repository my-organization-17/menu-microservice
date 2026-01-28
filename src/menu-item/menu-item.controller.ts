import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import { MENU_ITEM_SERVICE_NAME, type MenuItemList, type MenuItem } from 'src/generated-types/menu-item';
import { MenuItemService } from './menu-item.service';

@Controller()
export class MenuItemController {
  constructor(private readonly menuItemService: MenuItemService) {}
  protected readonly logger = new Logger(MenuItemController.name);

  @GrpcMethod(MENU_ITEM_SERVICE_NAME, 'GetMenuItemById')
  async getMenuItemById(data: { id: string }): Promise<MenuItem> {
    this.logger.log(`Received gRPC request: GetMenuItemById with id ${data.id}`);
    return this.menuItemService.getMenuItemById(data.id);
  }

  @GrpcMethod(MENU_ITEM_SERVICE_NAME, 'GetMenuItemsByCategoryId')
  async getMenuItemsByCategoryId(data: { id: string }): Promise<MenuItemList> {
    this.logger.log(`Received gRPC request: GetMenuItemsByCategoryId with id ${data.id}`);
    return this.menuItemService.getMenuItemsByCategoryId(data.id);
  }
}
