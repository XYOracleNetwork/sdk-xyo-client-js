import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { ConfigPayload } from './Payload'
import { ConfigSchema } from './Schema'
import { configPayloadTemplate } from './Template'

export const ConfigPayloadPlugin = () =>
  createXyoPayloadPlugin<ConfigPayload>({
    schema: ConfigSchema,
    template: configPayloadTemplate,
  })
