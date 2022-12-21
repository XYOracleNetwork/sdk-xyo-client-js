import { XyoPayload } from '../XyoPayload'
import { PayloadSetSchema } from './PayloadSetSchema'

export interface PayloadSet {
  optional?: Record<string, number>
  required?: Record<string, number>
}

export type PayloadSetPayload = XyoPayload<PayloadSet, PayloadSetSchema>
