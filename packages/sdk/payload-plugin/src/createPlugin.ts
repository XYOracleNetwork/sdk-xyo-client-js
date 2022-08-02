import { assertEx } from '@xylabs/sdk-js'
import { EmptyObject } from '@xyo-network/core'
import { XyoPayload, XyoPayloadValidator, XyoPayloadWrapper } from '@xyo-network/payload'

import { XyoPayloadPlugin } from './Plugin'

export const defaultXyoPayloadPluginFunctions = <TPayload extends XyoPayload>() => {
  return {
    validate: function (payload: TPayload): XyoPayloadValidator<TPayload> {
      return new XyoPayloadValidator<TPayload>(payload)
    },
    wrap: function (payload: TPayload): XyoPayloadWrapper<TPayload> {
      return new XyoPayloadWrapper(payload)
    },
  }
}

export const createXyoPayloadPlugin = <
  TSchema extends string = string,
  TPayload extends XyoPayload = XyoPayload,
  TWitnessConfig extends EmptyObject = EmptyObject,
  TDivinerConfig extends EmptyObject = EmptyObject
>(
  plugin: Partial<XyoPayloadPlugin<TSchema, TPayload, TWitnessConfig, TDivinerConfig>> & { schema: string }
): XyoPayloadPlugin<TSchema, TPayload, TWitnessConfig, TDivinerConfig> => {
  return {
    ...defaultXyoPayloadPluginFunctions<TPayload>(),
    ...plugin,
    schema: assertEx(plugin.schema, 'schema field required to cretae plugin'),
  }
}
