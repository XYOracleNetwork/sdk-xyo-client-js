import { assertEx } from '@xylabs/assert'
import { PayloadValidator, PayloadWrapper, XyoPayload, XyoPayloadSchema } from '@xyo-network/payload'

import { XyoPayloadPlugin } from './Plugin'

export const defaultXyoPayloadPluginFunctions = <T extends XyoPayload>(): XyoPayloadPlugin<T> => {
  return {
    schema: XyoPayloadSchema,
    validate: (payload: XyoPayload): PayloadValidator<T> => {
      return new PayloadValidator<T>(payload as T)
    },
    wrap: (payload: XyoPayload): PayloadWrapper<T> => {
      return new PayloadWrapper<T>(payload as T)
    },
  }
}

export const createXyoPayloadPlugin = <TPayload extends XyoPayload = XyoPayload>(plugin: XyoPayloadPlugin<TPayload>): XyoPayloadPlugin<TPayload> => {
  return {
    ...defaultXyoPayloadPluginFunctions<TPayload>(),
    ...plugin,
    schema: assertEx(plugin.schema, 'schema field required to create plugin'),
  }
}
