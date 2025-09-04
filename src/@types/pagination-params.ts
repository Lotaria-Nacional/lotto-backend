import z from 'zod';
import { paramsSchema } from '../schemas/common/query.schema';

export type PaginationParams = z.infer<typeof paramsSchema>;
