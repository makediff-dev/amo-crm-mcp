import { BaseModule } from '../../lib/baseModule';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { AmoServerContext } from '../../core/context';
import { AmoLeadsService } from './amoLeads.service';
import { AmoLeadsController } from './amoLeads.controller';

export class AmoLeadsModule extends BaseModule<AmoServerContext> {
  constructor() {
    super('amo-leads');
  }

  register = (server: McpServer, context: AmoServerContext) => {
    const service = context.services.getOrCreate(
      AmoLeadsService,
      () => new AmoLeadsService(context.amo)
    );
    const controller = context.controllers.getOrCreate(
      AmoLeadsController,
      () => new AmoLeadsController(service, context.logger, context.env.APP_TIMEZONE)
    );

    this.registerTools(server, controller);
  };
}
