import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoNodeSystemInfoPayload } from './Payload'
import { XyoNodeSystemInfoSchema } from './Schema'
import { systemInfoNodeWitnessTemplate } from './Template'

export const NodeSystemInfoPayloadPlugin = () =>
  createXyoPayloadPlugin<XyoNodeSystemInfoPayload>({
    schema: XyoNodeSystemInfoSchema,
    template: systemInfoNodeWitnessTemplate,
  })
