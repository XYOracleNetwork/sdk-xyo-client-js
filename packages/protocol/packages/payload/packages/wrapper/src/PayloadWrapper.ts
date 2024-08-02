import { Payload } from '@xyo-network/payload-model'

import { PayloadDataWrapper } from './PayloadDataWrapper.ts'
import { isPayloadWrapperBase } from './PayloadWrapperBase.ts'

export const isPayloadWrapper = (value?: unknown): value is PayloadWrapper => {
  return isPayloadWrapperBase(value)
}

export class PayloadWrapper<TPayload extends Payload = Payload> extends PayloadDataWrapper<TPayload> {}
