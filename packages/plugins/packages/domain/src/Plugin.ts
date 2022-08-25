import { assertEx } from '@xylabs/sdk-js'
import { XyoPayload } from '@xyo-network/payload'
import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoDomainWitnessConfig } from './Config'
import { XyoDomainPayload } from './Payload'
import { XyoDomainPayloadSchema } from './Schema'
import { XyoDomainWitness } from './Witness'
import { XyoDomainPayloadWrapper } from './Wrapper'

export const XyoDomainPayloadPlugin = () =>
  createXyoPayloadPlugin<XyoDomainPayload, XyoDomainWitnessConfig>({
    schema: XyoDomainPayloadSchema,
    witness: (config): XyoDomainWitness => {
      return new XyoDomainWitness(config)
    },
    wrap: (payload: XyoPayload): XyoDomainPayloadWrapper => {
      assertEx(payload.schema === XyoDomainPayloadSchema)
      return new XyoDomainPayloadWrapper(payload as XyoDomainPayload)
    },
  })
