import { XyoModuleInstancePayload } from './Payload'
import { XyoModuleInstanceSchema } from './Schema'

export const XyoModuleInstancePayloadTemplate = (): Partial<XyoModuleInstancePayload> => {
  return {
    address: undefined,
    queries: undefined,
    schema: XyoModuleInstanceSchema,
  }
}
