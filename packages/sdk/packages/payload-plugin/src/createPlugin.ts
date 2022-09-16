import { assertEx } from '@xylabs/sdk-js'
import { XyoDivinerConfig } from '@xyo-network/diviner'
import { PayloadValidator, PayloadWrapper, XyoPayload } from '@xyo-network/payload'
import { XyoWitnessConfig } from '@xyo-network/witness'

import { XyoPayloadPlugin } from './Plugin'

export const defaultXyoPayloadPluginFunctions = <T extends XyoPayload>() => {
  return {
    validate: function (payload: T): PayloadValidator<T> {
      return new PayloadValidator<T>(payload)
    },
    wrap: function (payload: T): PayloadWrapper<T> {
      return new PayloadWrapper<T>(payload)
    },
  }
}

export const createXyoPayloadPlugin = <
  TPayload extends XyoPayload = XyoPayload,
  TWitnessConfig extends XyoWitnessConfig<TPayload> = XyoWitnessConfig<TPayload>,
  TDivinerConfig extends XyoDivinerConfig<TPayload> = XyoDivinerConfig<TPayload>,
>(
  plugin: XyoPayloadPlugin<TPayload, TWitnessConfig, TDivinerConfig> & { schema: string },
): XyoPayloadPlugin<TPayload, TWitnessConfig, TDivinerConfig> => {
  return {
    ...defaultXyoPayloadPluginFunctions(),
    ...plugin,
    schema: assertEx(plugin.schema, 'schema field required to create plugin'),
  }
}
