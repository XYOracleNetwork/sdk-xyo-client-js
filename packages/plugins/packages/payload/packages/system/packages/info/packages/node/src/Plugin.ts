import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { NodeSystemInfoPayload } from './Payload'
import { NodeSystemInfoSchema } from './Schema'
import { systemInfoNodeWitnessTemplate } from './Template'

export const NodeSystemInfoPayloadPlugin = () =>
  createPayloadPlugin<NodeSystemInfoPayload>({
    schema: NodeSystemInfoSchema,
    template: systemInfoNodeWitnessTemplate,
  })
