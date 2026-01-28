import type { Address } from '@xylabs/sdk-js'
import { asSchema, type Payload } from '@xyo-network/payload-model'

export const ChildCertificationSchema = asSchema('network.xyo.child.certification', true)
export type ChildCertificationSchema = typeof ChildCertificationSchema

export interface ChildCertificationFields {
  address: Address
  expiration: number
}

export type ChildCertification = Payload<ChildCertificationFields, ChildCertificationSchema>
