import { Payload } from '../Payload.js'
import { PayloadSetSchema } from './PayloadSetSchema.js'

export interface PayloadSet {
  optional?: Record<string, number>
  required?: Record<string, number>
}

export type PayloadSetPayload = Payload<PayloadSet, PayloadSetSchema>
