import { AmoService } from '../../core/amo';
import {
  amoTasksApiResponseSchema,
  TasksList
} from './amoTasks.schemas';

export class AmoTasksService {
  constructor(private readonly amoService: AmoService) {}

  async getActiveTasks(): Promise<TasksList> {
    const data = await this.amoService.request({
      path: '/tasks',
      query: { 'filter[is_completed]': 0 }
    });

    // AmoCRM returns 204 No Content (empty response) when there are no results
    if (!data) {
      return [];
    }

    const parsed = amoTasksApiResponseSchema.parse(data);
    return parsed._embedded.tasks;
  }
}
