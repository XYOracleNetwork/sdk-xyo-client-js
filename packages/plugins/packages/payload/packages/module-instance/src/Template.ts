import { AbstractModuleInstancePayload } from './Payload'
import { AbstractModuleInstanceSchema } from './Schema'

export const moduleInstancePayloadTemplate = (): Partial<AbstractModuleInstancePayload> => {
  return {
    address: undefined,
    queries: undefined,
    schema: AbstractModuleInstanceSchema,
  }
}
