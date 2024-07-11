import { Payload } from '@xyo-network/payload-model'

import { PayloadDataWrapper } from './PayloadDataWrapper.js'
import { isPayloadWrapperBase } from './PayloadWrapperBase.js'

export const isPayloadWrapper = (value?: unknown): value is PayloadWrapper => {
  return isPayloadWrapperBase(value)
}

export class PayloadWrapper<TPayload extends Payload = Payload> extends PayloadDataWrapper<TPayload> {}
