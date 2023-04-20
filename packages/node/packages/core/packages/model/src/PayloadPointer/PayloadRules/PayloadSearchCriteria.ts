import { SortDirection } from '@xyo-network/diviner'

export interface PayloadSearchCriteria {
  addresses: string[]
  direction: SortDirection
  schemas: string[]
  timestamp: number
}
