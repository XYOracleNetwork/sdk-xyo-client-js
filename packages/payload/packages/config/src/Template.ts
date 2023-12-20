import { ConfigPayload } from './Payload'
import { ConfigSchema } from './Schema'

export const configPayloadTemplate = (): ConfigPayload => ({
  config: '',
  schema: ConfigSchema,
})
