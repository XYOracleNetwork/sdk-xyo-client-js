import { assertEx } from '@xylabs/assert'
import { PayloadValidator, PayloadWrapper, XyoPayload } from '@xyo-network/payload'

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

export const createXyoPayloadPlugin = <TPayload extends XyoPayload = XyoPayload>(plugin: XyoPayloadPlugin<TPayload>): XyoPayloadPlugin<TPayload> => {
  return {
    ...defaultXyoPayloadPluginFunctions(),
    ...plugin,
    schema: assertEx(plugin.schema, 'schema field required to create plugin'),
  }
}
