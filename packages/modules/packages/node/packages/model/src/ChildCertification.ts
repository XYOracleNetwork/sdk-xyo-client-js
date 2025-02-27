import type { Address } from '@xylabs/hex'
import type { Payload } from '@xyo-network/payload-model'

export const ChildCertificationSchema = 'network.xyo.child.certification' as const
export type ChildCertificationSchema = typeof ChildCertificationSchema

export interface ChildCertificationFields {
  address: Address
  expiration: number
}

export type ChildCertification = Payload<ChildCertificationFields, ChildCertificationSchema>
