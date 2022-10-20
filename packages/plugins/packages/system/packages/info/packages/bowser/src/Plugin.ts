import { XyoModuleParams } from '@xyo-network/module'
import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoBowserSystemInfoWitnessConfig } from './Config'
import { XyoBowserSystemInfoPayload } from './Payload'
import { XyoBowserSystemInfoSchema } from './Schema'
import { XyoBowserSystemInfoPayloadTemplate } from './Template'
import { XyoBowserSystemInfoWitness } from './Witness'

export const XyoBowserSystemInfoPayloadPlugin = () =>
  createXyoPayloadPlugin<XyoBowserSystemInfoPayload, XyoModuleParams<XyoBowserSystemInfoWitnessConfig>>({
    auto: true,
    schema: XyoBowserSystemInfoSchema,
    template: XyoBowserSystemInfoPayloadTemplate,
    witness: async (params) => {
      return await XyoBowserSystemInfoWitness.create(params)
    },
  })
