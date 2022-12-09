import { XyoBowserSystemInfoSchema } from '@xyo-network/bowser-system-info-payload-plugin'
import { XyoModuleParams } from '@xyo-network/module'
import { PayloadSetSchema } from '@xyo-network/payload'
import { createPayloadSetPlugin, PayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'

import { XyoBowserSystemInfoWitnessConfig } from './Config'
import { XyoBowserSystemInfoWitness } from './Witness'

export const XyoBowserSystemInfoPlugin = () =>
  createPayloadSetPlugin<PayloadSetWitnessPlugin<XyoModuleParams<XyoBowserSystemInfoWitnessConfig>>>(
    { required: { [XyoBowserSystemInfoSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        const result = await XyoBowserSystemInfoWitness.create(params)
        return result
      },
    },
  )
