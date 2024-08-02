import { ConfigPayload } from './Payload.ts'
import { ConfigSchema } from './Schema.ts'

export const configPayloadTemplate = (): ConfigPayload => ({
  config: '',
  schema: ConfigSchema,
})
