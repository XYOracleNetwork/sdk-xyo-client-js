import { Payload } from '@xyo-network/payload-model'

export const HashLeaseEstimateSchema = 'network.xyo.hash.lease.estimate'
export type HashLeaseEstimateSchema = typeof HashLeaseEstimateSchema

export type HashLeaseEstimate = Payload<{ currency: string; price: number }, HashLeaseEstimateSchema>
