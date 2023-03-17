import { Payload } from '../Payload'
import { PayloadSetSchema } from './PayloadSetSchema'

export interface PayloadSet {
  optional?: Record<string, number>
  required?: Record<string, number>
}

export type PayloadSetPayload = Payload<PayloadSet, PayloadSetSchema>
