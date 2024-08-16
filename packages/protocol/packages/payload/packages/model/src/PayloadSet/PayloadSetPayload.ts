import type { Payload } from '../Payload.ts'
import type { PayloadSetSchema } from './PayloadSetSchema.ts'

export interface PayloadSet {
  optional?: Record<string, number>
  required?: Record<string, number>
}

export type PayloadSetPayload = Payload<PayloadSet, PayloadSetSchema>
