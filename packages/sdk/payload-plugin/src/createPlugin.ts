import { assertEx } from '@xylabs/sdk-js'
import { XyoPayload, XyoPayloadValidator, XyoPayloadWrapper } from '@xyo-network/payload'

import { XyoPayloadPlugin } from './Plugin'

export const defaultXyoPayloadPluginFunctions = () => {
  return {
    validate: function (payload: XyoPayload): XyoPayloadValidator {
      return new XyoPayloadValidator(payload)
    },
    wrap: function (payload: XyoPayload): XyoPayloadWrapper {
      return new XyoPayloadWrapper(payload)
    },
  }
}

export const createXyoPayloadPlugin = <TSchema extends string = string, TPayload extends XyoPayload = XyoPayload>(
  plugin: Partial<XyoPayloadPlugin<TSchema, TPayload>> & { schema: string }
): XyoPayloadPlugin<TSchema, TPayload> => {
  return {
    ...defaultXyoPayloadPluginFunctions(),
    ...plugin,
    schema: assertEx(plugin.schema, 'schema field required to create plugin'),
  }
}
