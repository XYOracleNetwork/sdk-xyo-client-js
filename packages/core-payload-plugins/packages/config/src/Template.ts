import { ConfigPayload } from './Payload.js'
import { ConfigSchema } from './Schema.js'

export const configPayloadTemplate = (): ConfigPayload => ({
  config: '',
  schema: ConfigSchema,
})
