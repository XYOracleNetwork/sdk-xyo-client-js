import { assertEx } from '@xylabs/sdk-js'
import { XyoPayload, XyoPayloadValidator, XyoPayloadWrapper } from '@xyo-network/payload'

import { XyoPayloadPlugin } from './Plugin'

export const defaultXyoPayloadPluginFunctions = <T extends XyoPayload>() => {
  return {
    validate: function (payload: T): XyoPayloadValidator<T> {
      return new XyoPayloadValidator<T>(payload)
    },
    wrap: function (payload: T): XyoPayloadWrapper<T> {
      return new XyoPayloadWrapper<T>(payload)
    },
  }
}

export const createXyoPayloadPlugin = <TPayload extends XyoPayload = XyoPayload>(
  plugin: Partial<XyoPayloadPlugin<TPayload>> & { schema: string },
): XyoPayloadPlugin<TPayload> => {
  return {
    ...defaultXyoPayloadPluginFunctions(),
    ...plugin,
    schema: assertEx(plugin.schema, 'schema field required to create plugin'),
  }
}
