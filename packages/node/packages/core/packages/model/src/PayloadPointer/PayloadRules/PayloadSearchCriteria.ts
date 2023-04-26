import { SortDirection } from '@xyo-network/payload-diviner-model'

export interface PayloadSearchCriteria {
  addresses: string[]
  direction: SortDirection
  schemas: string[]
  timestamp: number
}
