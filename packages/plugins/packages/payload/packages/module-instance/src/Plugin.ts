import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoModuleInstancePayload } from './Payload'
import { XyoModuleInstanceSchema } from './Schema'
import { moduleInstancePayloadTemplate } from './Template'

export const ModuleInstancePayloadPlugin = () =>
  createXyoPayloadPlugin<XyoModuleInstancePayload>({
    schema: XyoModuleInstanceSchema,
    template: moduleInstancePayloadTemplate,
  })
