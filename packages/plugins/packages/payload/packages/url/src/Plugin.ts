import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { UrlPayload } from './Payload'
import { UrlSchema } from './Schema'
import { urlPayloadTemplate } from './Template'

export const UrlPayloadPlugin = () =>
  createPayloadPlugin<UrlPayload>({
    schema: UrlSchema,
    template: urlPayloadTemplate,
  })
