import { XyoPayload, XyoPayloadValidator, XyoPayloadWrapper } from '@xyo-network/payload'

import { XyoPayloadPlugin } from './Plugin'

export const defaultXyoPayloadPluginFunctions = <TPayload extends XyoPayload>() => {
  return {
    validate: function (payload: TPayload): XyoPayloadValidator<TPayload> {
      return new XyoPayloadValidator<TPayload>(payload)
    },
    wrap: function (payload: TPayload): XyoPayloadWrapper<TPayload> {
      return new XyoPayloadWrapper<TPayload>(payload)
    },
  }
}

export const createXyoPayloadPlugin = <TPayload extends XyoPayload = XyoPayload>(
  plugin: XyoPayloadPlugin<TPayload> & { schema: string },
): XyoPayloadPlugin<TPayload> => {
  return {
    ...defaultXyoPayloadPluginFunctions<TPayload>(),
    ...plugin,
    schema: plugin.schema,
  }
}
