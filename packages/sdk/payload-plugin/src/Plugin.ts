import { EmptyObject, XyoValidator } from '@xyo-network/core'
import { XyoPayload, XyoPayloadWrapper } from '@xyo-network/payload'
import { XyoWitness } from '@xyo-network/witness'

import { XyoDiviner } from './XyoDiviner'

export interface XyoPayloadPlugin<
  TSchema extends string,
  TPayload extends XyoPayload = XyoPayload,
  TWitnessConfig extends EmptyObject = EmptyObject,
  TDivinerConfig extends EmptyObject = EmptyObject
> {
  schema: TSchema
  template?: TPayload
  validate: (payload: TPayload) => XyoValidator<TPayload>
  wrap: (payload: TPayload) => XyoPayloadWrapper<TPayload>
  witness?: (config?: TWitnessConfig) => XyoWitness<TPayload>
  diviner?: (config?: TDivinerConfig) => XyoDiviner<TPayload>
}

export type XyoPayloadPluginEntry = () => XyoPayloadPlugin<string>
