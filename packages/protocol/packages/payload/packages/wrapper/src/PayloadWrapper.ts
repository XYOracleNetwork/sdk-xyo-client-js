import { BaseParams } from '@xylabs/object'
import { Payload } from '@xyo-network/payload-model'

import { PayloadDataWrapper } from './PayloadDataWrapper'
import { isPayloadWrapperBase } from './PayloadWrapperBase'

export const isPayloadWrapper = (value?: unknown): value is PayloadWrapper => {
  return isPayloadWrapperBase(value)
}

export class PayloadWrapper<TPayload extends Payload = Payload, TParams extends BaseParams = BaseParams> extends PayloadDataWrapper<
  TPayload,
  TParams
> {}
