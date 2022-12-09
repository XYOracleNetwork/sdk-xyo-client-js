import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoPentairScreenlogicPayload } from './Payload'
import { XyoPentairScreenlogicSchema } from './Schema'

export const XyoPentairScreenlogicPayloadPlugin = () =>
  createXyoPayloadPlugin<XyoPentairScreenlogicPayload>({
    schema: XyoPentairScreenlogicSchema,
  })
