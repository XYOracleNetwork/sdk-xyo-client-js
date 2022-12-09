import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoBowserSystemInfoPayload } from './Payload'
import { XyoBowserSystemInfoSchema } from './Schema'
import { bowserSystemInfoPayloadTemplate } from './Template'

export const BowserSystemInfoPayloadPlugin = () =>
  createXyoPayloadPlugin<XyoBowserSystemInfoPayload>({
    schema: XyoBowserSystemInfoSchema,
    template: bowserSystemInfoPayloadTemplate,
  })
