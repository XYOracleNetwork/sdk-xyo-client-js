import type { ZodObject } from 'zod'

import { isAnyPayload } from './isPayload.ts'
import type { Payload } from './Payload.ts'

export function isPayloadOfZodType<
  T extends Payload | never = never,
  S extends ZodObject = ZodObject,
>(schema: T['schema'], zodSchema: S) {
  return (x?: unknown | null): x is T => {
    if (!isAnyPayload(x)) return false
    if (x?.schema !== schema) return false
    const { schema: _, ...data } = x
    return zodSchema.safeParse(data).success
  }
}
