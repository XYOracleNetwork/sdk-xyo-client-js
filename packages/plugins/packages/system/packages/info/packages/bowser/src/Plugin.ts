import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoBowserSystemInfoWitnessConfig } from './Config'
import { XyoBowserSystemInfoPayload } from './Payload'
import { XyoBowserSystemInfoSchema } from './Schema'
import { XyoBowserSystemInfoPayloadTemplate } from './Template'
import { XyoBowserSystemInfoWitness } from './Witness'

export const XyoBowserSystemInfoPayloadPlugin = () =>
  createXyoPayloadPlugin<XyoBowserSystemInfoPayload, XyoBowserSystemInfoWitnessConfig>({
    auto: true,
    schema: XyoBowserSystemInfoSchema,
    template: XyoBowserSystemInfoPayloadTemplate,
    witness: (params): XyoBowserSystemInfoWitness => {
      return new XyoBowserSystemInfoWitness(params)
    },
  })
