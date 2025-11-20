import type { Hash } from '@xylabs/hex'
import { AsObjectFactory } from '@xylabs/object'

import { isPayloadOfSchemaType } from './isPayloadOfSchemaType.ts'
import type { Payload } from './Payload.ts'
import type { Schema } from './Schema.ts'

// payload that wraps a complete boundwitness with its payloads for use in systems such as submission queues
export const PayloadBundleSchema = 'network.xyo.payload.bundle' as Schema
export type PayloadBundleSchema = typeof PayloadBundleSchema

export interface PayloadBundleFields<T extends Payload = Payload> {
  payloads: T[]
  root: Hash
}

export type PayloadBundle = Payload<PayloadBundleFields, PayloadBundleSchema>

export const isPayloadBundle = isPayloadOfSchemaType<PayloadBundle>(PayloadBundleSchema)

export const asPayloadBundle = AsObjectFactory.create(isPayloadBundle)
export const asOptionalPayloadBundle = AsObjectFactory.createOptional(isPayloadBundle)
