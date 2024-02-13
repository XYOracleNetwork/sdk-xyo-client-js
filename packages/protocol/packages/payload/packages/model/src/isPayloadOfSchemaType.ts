import { isAnyPayload } from './isPayload'
import { Payload, WithMeta } from './Payload'

export const isPayloadOfSchemaType = <T extends Payload>(schema: string) => {
  return (x?: unknown | null): x is T => isAnyPayload(x) && x?.schema === schema
}

export const isPayloadOfSchemaTypeWithMeta = <T extends Payload>(schema: string) => {
  return (x?: unknown | null): x is WithMeta<T> => isPayloadOfSchemaType<WithMeta<T>>(schema)(x) && x.$hash !== undefined && x.$meta !== undefined
}

export const notPayloadOfSchemaType = <T extends Payload>(schema: string) => {
  return (x?: unknown | null): x is T => !isAnyPayload(x) || x?.schema !== schema
}
