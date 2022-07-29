import { EmptyObject } from '@xyo-network/core'
import { XyoPayload, XyoPayloadValidator, XyoPayloadWrapper } from '@xyo-network/payload'
import { XyoSimpleWitness, XyoWitness } from '@xyo-network/witnesses'

import { XyoPayloadPlugin } from './Plugin'

export const createXyoPayloadPlugin = <TSchema extends string = string, TPayload extends XyoPayload = XyoPayload, TWitnessConfig extends EmptyObject = EmptyObject>(
  plugin: Partial<XyoPayloadPlugin<TSchema, TPayload, TWitnessConfig>> & { schema: string }
): XyoPayloadPlugin<TSchema, TPayload, TWitnessConfig> => {
  return {
    validate: function (payload: TPayload): XyoPayloadValidator<TPayload> {
      return new XyoPayloadValidator<TPayload>(payload)
    },
    witness: function (config?: TWitnessConfig): XyoWitness<TPayload> {
      return new XyoSimpleWitness<TPayload>({ schema: plugin.schema, ...config })
    },
    wrap: function (payload: TPayload): XyoPayloadWrapper<TPayload> {
      return new XyoPayloadWrapper(payload)
    },
    ...plugin,
  }
}
