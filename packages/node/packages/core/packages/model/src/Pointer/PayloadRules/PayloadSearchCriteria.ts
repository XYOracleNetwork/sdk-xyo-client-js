import { SortDirection } from '@xyo-network/diviner-payload-model'

export interface PayloadSearchCriteria {
  addresses: string[]
  direction: SortDirection
  schemas: string[]
  timestamp: number
}
