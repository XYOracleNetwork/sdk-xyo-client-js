import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoBowserSystemInfoWitnessConfig } from './Config'
import { XyoBowserSystemInfoPayload } from './Payload'
import { XyoBowserSystemInfoPayloadSchema } from './Schema'
import { XyoBowserSystemInfoPayloadTemplate } from './Template'
import { XyoBowserSystemInfoWitness } from './Witness'

export const XyoBowserSystemInfoPayloadPlugin = () =>
  createXyoPayloadPlugin<XyoBowserSystemInfoPayload, XyoBowserSystemInfoWitnessConfig>({
    auto: true,
    schema: XyoBowserSystemInfoPayloadSchema,
    template: XyoBowserSystemInfoPayloadTemplate,
    witness: (config): XyoBowserSystemInfoWitness => {
      return new XyoBowserSystemInfoWitness(config)
    },
  })
