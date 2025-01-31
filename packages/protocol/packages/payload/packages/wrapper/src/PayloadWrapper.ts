import type { EmptyObject } from '@xylabs/object'
import type { Payload, Schema } from '@xyo-network/payload-model'

import { PayloadDataWrapper } from './PayloadDataWrapper.ts'
import { isPayloadWrapperBase } from './PayloadWrapperBase.ts'

export const isPayloadWrapper = (value?: unknown): value is PayloadWrapper => {
  return isPayloadWrapperBase(value)
}

export class PayloadWrapper<TFields extends Payload | EmptyObject = EmptyObject,
  TSchema extends Schema = TFields extends Payload ? TFields['schema'] : Schema> extends PayloadDataWrapper<TFields, TSchema> {}
