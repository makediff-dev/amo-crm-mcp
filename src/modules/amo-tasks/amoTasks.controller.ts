import { AmoTasksService } from './amoTasks.service';
import { tasksListResultSchema, TasksList } from './amoTasks.schemas';
import { Logger } from '../../lib/logger/index';
import { BaseController, Tool, ToolResult } from '../../lib/baseController';

export class AmoTasksController extends BaseController {
  constructor(
    private readonly service: AmoTasksService,
    logger: Logger,
    private readonly timezone: string
  ) {
    super(logger);
  }

  private formatDate(timestamp?: number): string {
    if (!timestamp) return 'без срока';
    const date = new Date(timestamp * 1000);
    return new Intl.DateTimeFormat('ru-RU', {
      timeZone: this.timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
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
      const due = this.formatDate(task.complete_till);
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
