import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { UrlSafetyPayload } from './Payload'
import { UrlSafetySchema } from './Schema'

export const UrlSafetyPayloadPlugin = () =>
  createPayloadPlugin<UrlSafetyPayload>({
    schema: UrlSafetySchema,
  })
