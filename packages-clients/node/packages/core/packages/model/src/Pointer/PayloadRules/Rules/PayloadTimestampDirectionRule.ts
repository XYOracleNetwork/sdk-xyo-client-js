import { SortDirection } from '@xyo-network/diviner-payload-model'

export interface PayloadTimestampDirectionRule {
  direction?: SortDirection
  timestamp: number
}
