import { assertEx } from '@xylabs/assert'
import { createXyoPayloadPlugin, XyoPayloadPlugin, XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'
import { XyoWitnessConfig } from '@xyo-network/witness'

import { XyoBowserSystemInfoPayload } from './Payload'
import { XyoBowserSystemInfoPayloadSchema } from './Schema'
import { XyoBowserSystemInfoPayloadTemplate } from './Template'
import { XyoBowserSystemInfoWitness } from './Witness'

export type XyoBowserSystemInfoWitnessConfigSchema = 'network.xyo.system.info.bowser.witness.config'
export const XyoBowserSystemInfoWitnessConfigSchema: XyoBowserSystemInfoWitnessConfigSchema = 'network.xyo.system.info.bowser.witness.config'

export type XyoBowserSystemInfoWitnessConfig = XyoWitnessConfig<XyoBowserSystemInfoPayload, { schema: XyoBowserSystemInfoWitnessConfigSchema }>

export const XyoBowserSystemInfoPayloadPlugin: XyoPayloadPluginFunc<XyoBowserSystemInfoPayload, XyoBowserSystemInfoWitnessConfig> = (
  config?,
): XyoPayloadPlugin<XyoBowserSystemInfoPayload> =>
  createXyoPayloadPlugin({
    auto: true,
    schema: XyoBowserSystemInfoPayloadSchema,
    template: XyoBowserSystemInfoPayloadTemplate,
    witness: (): XyoBowserSystemInfoWitness => {
      return new XyoBowserSystemInfoWitness(assertEx(config?.witness, 'Missing config'))
    },
  })
