import {
  leadsListResultSchema,
  singleLeadInputSchema,
  leadDetailsResultSchema,
  listLeadsInputSchema,
  LeadsListResult,
  ListLeadsInput,
  Lead,
  SingleLeadInput,
  LeadDetailsResult
} from './amoLeads.schemas';
import { AmoLeadsService } from './amoLeads.service';
import { Logger } from '../../lib/logger/index';
import { BaseController, Tool, ToolResult } from '../../lib/baseController';
import { DateFormatter } from '../../core/dateFormatter';

export class AmoLeadsController extends BaseController {
  private readonly dateFormatter: DateFormatter;

  constructor(
    private readonly service: AmoLeadsService,
    logger: Logger,
    timezone: string
  ) {
    super(logger);
    this.dateFormatter = new DateFormatter(timezone);
  }

  private leadSummary(lead: Lead): string {
    const name = lead.name?.trim() || 'Без названия';
    const price = lead.price !== undefined ? `${lead.price}₽` : 'цена не указана';
    const pipeline = lead.pipeline_id ? `воронка ${lead.pipeline_id}` : 'воронка не указана';
    const status = lead.status_id ? `этап ${lead.status_id}` : 'этап не указан';
    const responsible = lead.responsible_user_id
      ? `ответственный ${lead.responsible_user_id}`
      : 'ответственный не указан';
    const created = `создано: ${this.dateFormatter.format(lead.created_at)}`;
    return `#${lead.id}: ${name} (${price}; ${pipeline}; ${status}; ${responsible}; ${created})`;
  }

  @Tool({
    name: 'get_leads',
    title: 'Get leads from AmoCRM',
    description: 'Возвращает список сделок AmoCRM с фильтрацией и пагинацией.',
    inputSchema: listLeadsInputSchema,
    outputSchema: leadsListResultSchema,
    errorLogMessage: 'Failed to fetch leads from AmoCRM',
    errorLlmMessage: 'Не удалось получить список сделок из AmoCRM.'
  })
  private async getLeads(input: ListLeadsInput): Promise<ToolResult<LeadsListResult>> {
    const leads = await this.service.getLeads(input);

    const lines = leads.map((lead) => `- ${this.leadSummary(lead)}`);
    const summary =
      leads.length === 0
        ? 'Сделки не найдены.'
        : `Найдено сделок: ${leads.length}.`;

    return {
      structuredContent: { leads },
      content: [
        {
          type: 'text',
          text:
            leads.length === 0
              ? summary
              : `${summary}\nСписок:\n${lines.join('\n')}`
        }
      ]
    };
  }

  @Tool({
    name: 'get_lead_by_id',
    title: 'Get lead by id from AmoCRM',
    description: 'Возвращает полную информацию по сделке по ее id.',
    inputSchema: singleLeadInputSchema,
    outputSchema: leadDetailsResultSchema,
    errorLogMessage: 'Failed to fetch lead by id from AmoCRM',
    errorLlmMessage: 'Не удалось получить сделку по указанному id.'
  })
  private async getLeadById(
    input: SingleLeadInput
  ): Promise<ToolResult<LeadDetailsResult>> {
    const { lead, nearest_task } = await this.service.getLeadById({ id: input.id });

    const tags =
      lead.tags && lead.tags.length
        ? `теги: ${lead.tags.map((t) => t.name ?? t.id).join(', ')}`
        : 'теги отсутствуют';

    const customFields =
      lead.custom_fields_values && lead.custom_fields_values.length
        ? lead.custom_fields_values
            .map((field) => {
              const values =
                field.values?.map((v) => (typeof v.value === 'object' ? JSON.stringify(v.value) : `${v.value}`)).join(', ') ??
                '—';
              return `${field.field_name ?? field.field_id}: ${values}`;
            })
            .join('\n')
        : 'кастомные поля отсутствуют';

    const nearestTaskText = nearest_task
      ? `Ближайшая задача: #${nearest_task.id} "${nearest_task.text ?? 'без названия'}", срок: ${this.dateFormatter.format(nearest_task.complete_till)}`
      : 'Ближайших незавершенных задач нет.';

    const text = [
      `Сделка #${lead.id}`,
      `Название: ${lead.name ?? 'не указано'}`,
      `Сумма: ${lead.price ?? 'не указана'}`,
      `Воронка: ${lead.pipeline_id ?? 'не указана'}, этап: ${lead.status_id ?? 'не указан'}`,
      `Ответственный: ${lead.responsible_user_id ?? 'не указан'}`,
      `Создана: ${this.dateFormatter.format(lead.created_at)}`,
      `Обновлена: ${this.dateFormatter.format(lead.updated_at)}`,
      `Закрыта: ${this.dateFormatter.format(lead.closed_at ?? undefined)}`,
      tags,
      `Кастомные поля:\n${customFields}`,
      nearestTaskText
    ].join('\n');

    return {
      structuredContent: { lead, nearest_task },
      content: [
        {
          type: 'text',
          text
        }
      ]
    };
  }
}
