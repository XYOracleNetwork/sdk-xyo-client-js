import { UrlPayload } from './Payload'
import { UrlSchema } from './Schema'

export const urlPayloadTemplate = (): UrlPayload => ({
  schema: UrlSchema,
  url: '',
})
