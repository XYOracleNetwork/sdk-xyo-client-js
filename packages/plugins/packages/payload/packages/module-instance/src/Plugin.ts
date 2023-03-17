import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { AbstractModuleInstancePayload } from './Payload'
import { AbstractModuleInstanceSchema } from './Schema'
import { moduleInstancePayloadTemplate } from './Template'

export const ModuleInstancePayloadPlugin = () =>
  createPayloadPlugin<AbstractModuleInstancePayload>({
    schema: AbstractModuleInstanceSchema,
    template: moduleInstancePayloadTemplate,
  })
