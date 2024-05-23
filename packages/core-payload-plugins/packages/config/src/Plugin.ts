import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { ConfigPayload } from './Payload'
import { ConfigSchema } from './Schema'
import { configPayloadTemplate } from './Template'

export const ConfigPayloadPlugin = () =>
  createPayloadPlugin<ConfigPayload>({
    schema: ConfigSchema,
    template: configPayloadTemplate,
  })
