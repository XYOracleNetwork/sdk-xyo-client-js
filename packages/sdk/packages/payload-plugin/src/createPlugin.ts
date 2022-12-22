import { assertEx } from '@xylabs/assert'
import { XyoPayloadBuilder } from '@xyo-network/payload-builder'
import { XyoPayload } from '@xyo-network/payload-model'
import { PayloadValidator } from '@xyo-network/payload-validator'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

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
