import { assertEx } from '@xylabs/sdk-js'
import { XyoPayload } from '@xyo-network/payload'
import { createXyoPayloadPlugin, XyoPayloadPlugin, XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'

import { XyoDomainPayload } from './Payload'
import { XyoDomainPayloadSchema } from './Schema'
import { XyoDomainWitness, XyoDomainWitnessConfigSchema } from './Witness'
import { XyoDomainPayloadWrapper } from './Wrapper'

export const XyoDomainPayloadPlugin: XyoPayloadPluginFunc<XyoDomainPayloadSchema, XyoDomainPayload, XyoDomainWitnessConfigSchema> = (
  config?,
): XyoPayloadPlugin<XyoDomainPayload> =>
  createXyoPayloadPlugin({
    schema: XyoDomainPayloadSchema,
    witness: (): XyoDomainWitness => {
      return new XyoDomainWitness(assertEx(config?.witness, 'Missing config'))
    },
    wrap: (payload: XyoPayload): XyoDomainPayloadWrapper => {
      assertEx(payload.schema === XyoDomainPayloadSchema)
      return new XyoDomainPayloadWrapper(payload as XyoDomainPayload)
    },
  })
