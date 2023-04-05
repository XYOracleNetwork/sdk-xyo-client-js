import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoPentairScreenlogicPayload } from './Payload'
import { XyoPentairScreenlogicSchema } from './Schema'

export const XyoPentairScreenlogicPayloadPlugin = () =>
  createPayloadPlugin<XyoPentairScreenlogicPayload>({
    schema: XyoPentairScreenlogicSchema,
  })
