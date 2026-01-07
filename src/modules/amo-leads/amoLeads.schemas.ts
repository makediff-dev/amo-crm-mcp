import { z } from 'zod';

export const leadTagSchema = z.object({
  id: z.number(),
  name: z.string().optional()
});

export const leadSchema = z.object({
  id: z.number(),
  name: z.string().nullable().optional(),
  status_id: z.number().optional(),
  pipeline_id: z.number().optional(),
  responsible_user_id: z.number().optional(),
  price: z.number().optional(),
  created_at: z.number().optional(),
  updated_at: z.number().optional(),
  closed_at: z.number().nullable().optional(),
  tags: z.array(leadTagSchema).optional(),
  custom_fields_values: z
    .array(
      z.object({
        field_id: z.number().optional(),
        field_name: z.string().optional(),
        values: z
          .array(
            z.object({
              value: z.unknown(),
              enum_id: z.number().optional(),
              enum_code: z.string().nullable().optional()
            })
          )
          .optional()
      })
    )
    .nullable()
    .optional()
});

export const leadsListResponseSchema = z.object({
  _embedded: z.object({
    leads: z.array(leadSchema)
  })
});

export const listLeadsInputSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(250).optional(),
  pipeline_id: z.number().optional(),
  status_id: z.number().optional(),
  responsible_user_id: z.number().optional(),
  query: z.string().optional(),
  created_at_from: z.number().int().optional(),
  created_at_to: z.number().int().optional(),
  sort_by: z
    .enum(['created_at', 'updated_at', 'id'])
    .default('created_at')
    .optional(),
  sort_order: z.enum(['asc', 'desc']).default('desc').optional()
});

export const leadsListResultSchema = z.object({
  leads: z.array(leadSchema)
});

export const singleLeadInputSchema = z.object({
  id: z.number().int().positive()
});

export const singleLeadResultSchema = z.object({
  lead: leadSchema
});

export const leadDetailsResultSchema = z.object({
  lead: leadSchema,
  nearest_task: z
    .object({
      id: z.number(),
      text: z.string().nullable().optional(),
      complete_till: z.number().optional()
    })
    .optional()
});

export type Lead = z.infer<typeof leadSchema>;
export type LeadsListResult = z.infer<typeof leadsListResultSchema>;
export type ListLeadsInput = z.infer<typeof listLeadsInputSchema>;
export type SingleLeadInput = z.infer<typeof singleLeadInputSchema>;
export type LeadDetailsResult = z.infer<typeof leadDetailsResultSchema>;
