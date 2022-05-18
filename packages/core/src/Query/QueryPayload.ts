import { XyoPayload } from '../Payload'

export interface XyoQueryPayload extends XyoPayload {
  budget?: number
  maxFrequency?: 'once' | 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year'
  minBid?: number
}
