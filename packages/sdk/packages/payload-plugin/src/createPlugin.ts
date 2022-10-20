import { assertEx } from '@xylabs/assert'
import { XyoDivinerConfig } from '@xyo-network/diviner'
import { XyoModuleParams } from '@xyo-network/module'
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
  TWitnessParams extends XyoModuleParams<XyoWitnessConfig> = XyoModuleParams<XyoWitnessConfig>,
  TDivinerParams extends XyoModuleParams<XyoDivinerConfig> = XyoModuleParams<XyoDivinerConfig>,
>(
  plugin: XyoPayloadPlugin<TPayload, TWitnessParams, TDivinerParams> & { schema: string },
): XyoPayloadPlugin<TPayload, TWitnessParams, TDivinerParams> => {
  return {
    ...defaultXyoPayloadPluginFunctions(),
    ...plugin,
    schema: assertEx(plugin.schema, 'schema field required to create plugin'),
  }
}
