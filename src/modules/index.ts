import { ServerModule } from '../lib/baseModule';
import { AmoServerContext } from '../core/context';
import { HealthModule } from './health/health.module';
import { AmoTasksModule } from './amo-tasks/amoTasks.module';
import { AmoPipelinesModule } from './amo-pipelines/amoPipelines.module';
import { AmoLeadsModule } from './amo-leads/amoLeads.module';

export const modules: ServerModule<AmoServerContext>[] = [
  new HealthModule(),
  new AmoTasksModule(),
  new AmoPipelinesModule(),
  new AmoLeadsModule()
];
