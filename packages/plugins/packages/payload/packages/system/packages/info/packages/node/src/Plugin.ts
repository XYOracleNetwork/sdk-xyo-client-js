import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoNodeSystemInfoPayload } from './Payload'
import { XyoNodeSystemInfoSchema } from './Schema'
import { systemInfoNodeWitnessTemplate } from './Template'

export const NodeSystemInfoPayloadPlugin = () =>
  createPayloadPlugin<XyoNodeSystemInfoPayload>({
    schema: XyoNodeSystemInfoSchema,
    template: systemInfoNodeWitnessTemplate,
  })
