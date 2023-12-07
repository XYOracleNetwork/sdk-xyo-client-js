import { isAnyPayload } from './isPayload'
import { Payload } from './Payload'

export const isPayloadOfSchemaType = <T extends Payload>(schema: string) => {
  return (x?: unknown | null): x is T => isAnyPayload(x) && x?.schema === schema
}

export const notPayloadOfSchemaType = <T extends Payload>(schema: string) => {
  return (x?: unknown | null): x is T => !isAnyPayload(x) || x?.schema !== schema
}
