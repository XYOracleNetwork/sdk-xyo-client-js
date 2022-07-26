import { XyoPayload, XyoPayloadValidator, XyoPayloadWrapper } from '@xyo-network/payload'
import { XyoSimpleWitness, XyoWitness } from '@xyo-network/witnesses'

import { XyoPayloadPlugin } from './Plugin'

export const createXyoPayloadPlugin = <TSchema extends string = string, TPayload extends XyoPayload = XyoPayload>(
  plugin: Partial<XyoPayloadPlugin<TSchema, TPayload>> & { schema: string }
): XyoPayloadPlugin<TSchema, TPayload> => {
  return {
    validate: function (payload: TPayload): XyoPayloadValidator<TPayload> {
      return new XyoPayloadValidator<TPayload>(payload)
    },
    witness: function (): XyoWitness<TPayload> {
      return new XyoSimpleWitness<TPayload>({ schema: plugin.schema })
    },
    wrap: function (payload: TPayload): XyoPayloadWrapper<TPayload> {
      return new XyoPayloadWrapper(payload)
    },
    ...plugin,
  }
}
