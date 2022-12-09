import { assertEx } from '@xylabs/assert'
import { PayloadValidator, PayloadWrapper, XyoPayload, XyoPayloadBuilder } from '@xyo-network/payload'

import { XyoPayloadPlugin } from './Plugin'

export const defaultXyoPayloadPluginFunctions = <T extends XyoPayload>(schema: string): XyoPayloadPlugin<T> => {
  return {
    build: (): XyoPayloadBuilder<T> => {
      return new XyoPayloadBuilder<T>({ schema })
    },
    schema,
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
    ...defaultXyoPayloadPluginFunctions<TPayload>(assertEx(plugin.schema, 'schema field required to create plugin')),
    ...plugin,
  }
}
