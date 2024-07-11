import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { ConfigPayload } from './Payload.js'
import { ConfigSchema } from './Schema.js'
import { configPayloadTemplate } from './Template.js'

export const ConfigPayloadPlugin = () =>
  createPayloadPlugin<ConfigPayload>({
    schema: ConfigSchema,
    template: configPayloadTemplate,
  })
