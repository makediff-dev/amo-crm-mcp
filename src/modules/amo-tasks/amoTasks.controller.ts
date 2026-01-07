import { AmoTasksService } from './amoTasks.service';
import { tasksListResultSchema, TasksList } from './amoTasks.schemas';
import { Logger } from '../../lib/logger/index';
import { BaseController, Tool, ToolResult } from '../../lib/baseController';
import { DateFormatter } from '../../core/dateFormatter';

export class AmoTasksController extends BaseController {
  private readonly dateFormatter: DateFormatter;

  constructor(
    private readonly service: AmoTasksService,
    logger: Logger,
    timezone: string
  ) {
    super(logger);
    this.dateFormatter = new DateFormatter(timezone, { emptyValue: 'без срока' });
  }

  @Tool({
    name: 'get_active_tasks',
    title: 'Get active tasks from AmoCRM',
    description: 'Возвращает список невыполненных задач из AmoCRM.',
    outputSchema: tasksListResultSchema,
    errorLogMessage: 'Failed to fetch active tasks from AmoCRM',
    errorLlmMessage: 'Не удалось получить список задач из AmoCRM.'
  })
  private async getActiveTasks(): Promise<ToolResult<{ tasks: TasksList }>> {
    const tasks = await this.service.getActiveTasks();

    const lines = tasks.map((task) => {
      const title = task.text?.trim() || 'без названия';
      const due = this.dateFormatter.format(task.complete_till);
      const link =
        task.entity_type === 'leads'
          ? `лид #${task.entity_id}`
          : task.entity_type
            ? `${task.entity_type} #${task.entity_id ?? '—'}`
            : 'без привязки';
      return `- #${task.id}: ${title} (${link}, до ${due})`;
    });

    const summary =
      tasks.length === 0
        ? 'Активных задач нет.'
        : `Найдено активных задач: ${tasks.length}.`;

    return {
      structuredContent: { tasks },
      content: [
        {
          type: 'text',
          text:
            tasks.length === 0
              ? summary
              : `${summary}\nСписок:\n${lines.join('\n')}`
        }
      ]
    };
  }
}
