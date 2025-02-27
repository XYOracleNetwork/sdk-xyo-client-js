import { Payload } from '../Payload.ts'
import { PayloadSetSchema } from './PayloadSetSchema.ts'

export interface PayloadSet {
  optional?: Record<string, number>
  required?: Record<string, number>
}

export type PayloadSetPayload = Payload<PayloadSet, PayloadSetSchema>
