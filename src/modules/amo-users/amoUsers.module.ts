import { BaseModule } from '../../lib/base/baseModule';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { AmoServerContext } from '../../core/context';
import { AmoUsersService } from './amoUsers.service';
import { AmoUsersController } from './amoUsers.controller';

export class AmoUsersModule extends BaseModule<AmoServerContext> {
  constructor() {
    super('amo-users');
  }

  register = (server: McpServer, context: AmoServerContext) => {
    const service = context.services.getOrCreate(
      AmoUsersService,
      () => new AmoUsersService(context.amo)
    );
    const controller = context.controllers.getOrCreate(
      AmoUsersController,
      () => new AmoUsersController(service, context.logger)
    );

    this.registerTools(server, controller);
  };
}
