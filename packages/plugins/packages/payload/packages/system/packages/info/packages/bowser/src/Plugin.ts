import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { BowserSystemInfoPayload } from './Payload'
import { BowserSystemInfoSchema } from './Schema'
import { bowserSystemInfoPayloadTemplate } from './Template'

export const BowserSystemInfoPayloadPlugin = () =>
  createPayloadPlugin<BowserSystemInfoPayload>({
    schema: BowserSystemInfoSchema,
    template: bowserSystemInfoPayloadTemplate,
  })
