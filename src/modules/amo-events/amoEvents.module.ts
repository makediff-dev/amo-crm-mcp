import { BaseModule } from '../../lib/base/baseModule';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { AmoServerContext } from '../../core/context';
import { AmoEventsService } from './amoEvents.service';
import { AmoEventsController } from './amoEvents.controller';

export class AmoEventsModule extends BaseModule<AmoServerContext> {
  constructor() {
    super('amo-events');
  }

  register = (server: McpServer, context: AmoServerContext) => {
    const service = context.services.getOrCreate(
      AmoEventsService,
      () => new AmoEventsService(context.amo, context.logger)
    );
    const controller = context.controllers.getOrCreate(
      AmoEventsController,
      () => new AmoEventsController(service, context.logger, context.env.APP_TIMEZONE)
    );

    this.registerTools(server, controller);
  };
}
