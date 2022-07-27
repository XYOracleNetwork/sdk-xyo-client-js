import { XyoValidator } from '@xyo-network/core'
import { XyoPayload, XyoPayloadWrapper } from '@xyo-network/payload'
import { XyoWitness } from '@xyo-network/witnesses'

export interface XyoPayloadPlugin<TSchema extends string, TPayload extends XyoPayload = XyoPayload> {
  schema: TSchema
  template?: TPayload
  validate: (payload: TPayload) => XyoValidator<TPayload>
  witness: () => XyoWitness<TPayload>
  wrap: (payload: TPayload) => XyoPayloadWrapper<TPayload>
}

export type XyoPayloadPluginEntry = () => XyoPayloadPlugin<string>
