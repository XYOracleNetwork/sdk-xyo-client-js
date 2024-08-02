import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { ConfigPayload } from './Payload.ts'
import { ConfigSchema } from './Schema.ts'
import { configPayloadTemplate } from './Template.ts'

export const ConfigPayloadPlugin = () =>
  createPayloadPlugin<ConfigPayload>({
    schema: ConfigSchema,
    template: configPayloadTemplate,
  })
