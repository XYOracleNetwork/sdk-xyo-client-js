import { UrlPayload } from './Payload'
import { UrlSchema } from './Schema'

export const idPayloadTemplate = (): UrlPayload => ({
  schema: UrlSchema,
  url: '',
})
