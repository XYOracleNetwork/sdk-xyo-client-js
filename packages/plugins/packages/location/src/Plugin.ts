import { assertEx } from '@xylabs/assert'
import { createXyoPayloadPlugin, XyoPayloadPluginConfig, XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'

import { XyoLocationPayload } from './Payload'
import { XyoLocationPayloadSchema } from './Schema'
import { XyoLocationPayloadTemplate } from './Template'
import { XyoLocationWitness, XyoLocationWitnessConfig } from './Witness'

export const XyoLocationPayloadPlugin: XyoPayloadPluginFunc<
  XyoLocationPayloadSchema,
  XyoLocationPayload,
  XyoPayloadPluginConfig<XyoLocationWitnessConfig>
> = (config?) =>
  createXyoPayloadPlugin({
    auto: true,
    schema: XyoLocationPayloadSchema,
    template: XyoLocationPayloadTemplate,
    witness: (): XyoLocationWitness => {
      return new XyoLocationWitness(assertEx(config?.witness, 'Missing config'))
    },
  })
