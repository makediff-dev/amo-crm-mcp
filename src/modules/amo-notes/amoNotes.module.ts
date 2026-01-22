import { BaseModule } from '../../lib/base/baseModule';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { AmoServerContext } from '../../core/context';
import { AmoNotesService } from './amoNotes.service';
import { AmoNotesController } from './amoNotes.controller';

export class AmoNotesModule extends BaseModule<AmoServerContext> {
  constructor() {
    super('amo-notes');
  }

  register = (server: McpServer, context: AmoServerContext) => {
    const service = context.services.getOrCreate(
      AmoNotesService,
      () => new AmoNotesService(context.amo)
    );
    const controller = context.controllers.getOrCreate(
      AmoNotesController,
      () => new AmoNotesController(service, context.logger, context.env.APP_TIMEZONE)
    );

    this.registerTools(server, controller);
  };
}
