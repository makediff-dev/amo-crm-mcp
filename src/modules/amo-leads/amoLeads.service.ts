import { AmoService } from '../../core/amo';
import {
  LeadsListResult,
  leadsListResponseSchema,
  Lead,
  ListLeadsInput,
  SingleLeadInput,
  leadSchema,
  LeadDetailsResult
} from './amoLeads.schemas';
import { amoTasksApiResponseSchema } from '../amo-tasks/amoTasks.schemas';

export class AmoLeadsService {
  constructor(private readonly amoService: AmoService) {}

  async getLeads(input: ListLeadsInput): Promise<LeadsListResult['leads']> {
    const params: Record<string, string | number | boolean> = {};

    if (input.page !== undefined) params.page = input.page;
    if (input.limit !== undefined) params.limit = input.limit;
    if (input.pipeline_id !== undefined) params['filter[pipeline_id]'] = input.pipeline_id;
    if (input.responsible_user_id !== undefined) {
      params['filter[responsible_user_id]'] = input.responsible_user_id;
    }
    if (input.status_id !== undefined) {
      params['filter[statuses][0][status_id]'] = input.status_id;
      if (input.pipeline_id !== undefined) {
        params['filter[statuses][0][pipeline_id]'] = input.pipeline_id;
      }
    }
    if (input.query) {
      params.query = input.query;
    }
    if (input.created_at_from !== undefined) {
      params['filter[created_at][from]'] = input.created_at_from;
    }
    if (input.created_at_to !== undefined) {
      params['filter[created_at][to]'] = input.created_at_to;
    }

    // AmoCRM API uses format: order[field]=asc|desc
    const sortField = input.sort_by ?? 'created_at';
    const sortOrder = input.sort_order ?? 'desc';
    params[`order[${sortField}]`] = sortOrder;

    const data = await this.amoService.request({
      path: '/leads',
      query: params
    });

    // AmoCRM returns 204 No Content (empty response) when there are no results
    if (!data) {
      return [];
    }

    const parsed = leadsListResponseSchema.parse(data);
    return parsed._embedded.leads;
  }

  async getLeadById(input: SingleLeadInput): Promise<LeadDetailsResult> {
    const data = await this.amoService.request({
      path: `/leads/${input.id}`
    });

    const lead = leadSchema.parse(data);

    // Попытка получить ближайшую незавершенную задачу по сделке
    let nearestTask: LeadDetailsResult['nearest_task'];
    try {
      const tasksData = await this.amoService.request({
        path: '/tasks',
        query: {
          'filter[entity_id]': input.id,
          'filter[entity_type]': 'leads',
          'filter[is_completed]': 0,
          order: 'complete_till',
          limit: 1
        }
      });
      const parsedTasks = amoTasksApiResponseSchema.safeParse(tasksData);
      if (parsedTasks.success) {
        nearestTask = parsedTasks.data._embedded.tasks[0];
      }
    } catch {
      // Игнорируем ошибки задач, чтобы не ломать основной ответ
    }

    return { lead, nearest_task: nearestTask };
  }
}
