import { assertEx } from '@xylabs/sdk-js'
import { createXyoPayloadPlugin, XyoPayloadPlugin, XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'

import { XyoDomainPayload } from './Payload'
import { XyoDomainPayloadSchema } from './Schema'
import { XyoDomainWitness, XyoDomainWitnessConfig } from './Witness'
import { XyoDomainPayloadWrapper } from './Wrapper'

export const XyoDomainPayloadPlugin: XyoPayloadPluginFunc<XyoDomainPayload, XyoDomainWitnessConfig> = (config?): XyoPayloadPlugin<XyoDomainPayload> =>
  createXyoPayloadPlugin({
    schema: XyoDomainPayloadSchema,
    witness: (): XyoDomainWitness => {
      return new XyoDomainWitness(assertEx(config?.witness, 'Missing config'))
    },
    wrap: (payload: XyoDomainPayload): XyoDomainPayloadWrapper => {
      assertEx(payload.schema === XyoDomainPayloadSchema)
      return new XyoDomainPayloadWrapper(payload as XyoDomainPayload)
    },
  })
