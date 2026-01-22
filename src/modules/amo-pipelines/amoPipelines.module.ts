import { BaseModule } from '../../lib/base/baseModule';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { AmoServerContext } from '../../core/context';
import { AmoPipelinesService } from './amoPipelines.service';
import { AmoPipelinesController } from './amoPipelines.controller';

export class AmoPipelinesModule extends BaseModule<AmoServerContext> {
  constructor() {
    super('amo-pipelines');
  }

  register = (server: McpServer, context: AmoServerContext) => {
    const service = context.services.getOrCreate(
      AmoPipelinesService,
      () => new AmoPipelinesService(context.amo)
    );
    const controller = context.controllers.getOrCreate(
      AmoPipelinesController,
      () => new AmoPipelinesController(service, context.logger)
    );

    this.registerTools(server, controller);
  };
}
