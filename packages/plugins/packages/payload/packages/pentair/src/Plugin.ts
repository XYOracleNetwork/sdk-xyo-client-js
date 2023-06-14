import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { PentairScreenlogicPayload } from './Payload'
import { PentairScreenlogicSchema } from './Schema'

export const PentairScreenlogicPayloadPlugin = () =>
  createPayloadPlugin<PentairScreenlogicPayload>({
    schema: PentairScreenlogicSchema,
  })
