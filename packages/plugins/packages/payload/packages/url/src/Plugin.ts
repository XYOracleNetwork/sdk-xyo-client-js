import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { UrlPayload } from './Payload'
import { UrlSchema } from './Schema'
import { idPayloadTemplate } from './Template'

export const UrlPayloadPlugin = () =>
  createPayloadPlugin<UrlPayload>({
    schema: UrlSchema,
    template: idPayloadTemplate,
  })
