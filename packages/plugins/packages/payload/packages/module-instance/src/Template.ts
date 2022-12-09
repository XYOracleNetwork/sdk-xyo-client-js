import { XyoModuleInstancePayload } from './Payload'
import { XyoModuleInstanceSchema } from './Schema'

export const moduleInstancePayloadTemplate = (): Partial<XyoModuleInstancePayload> => {
  return {
    address: undefined,
    queries: undefined,
    schema: XyoModuleInstanceSchema,
  }
}
