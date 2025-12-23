import { isDefined } from '@xylabs/sdk-js'
import type { ZodObject } from 'zod'

import { isAnyPayload } from './isPayload.ts'
import type { Payload } from './Payload.ts'

/**
 * Checks if a value is a payload of a specific Zod type.
 * @param zodSchema The Zod schema to validate against
 * @param schema The schema string to match against the payload. Optional in
 * case you want to validate any payload matching the Zod schema or in case
 * schema is part of the Zod schema.
 * @returns A function that checks if a value is a payload of the specified Zod type
 */
export function isPayloadOfZodType<
  T extends Payload | never = never,
  S extends ZodObject = ZodObject,
>(zodSchema: S, schema?: T['schema']) {
  return (x?: unknown | null): x is T => {
    if (!isAnyPayload(x)) return false
    if (isDefined(schema) && x.schema !== schema) return false
    const { schema: _, ...data } = x
    return zodSchema.safeParse(data).success
  }
}
