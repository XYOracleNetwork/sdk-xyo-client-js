import { SortDirection } from '../../sortDirection'

export interface PayloadSearchCriteria {
  addresses: string[]
  direction: SortDirection
  schemas: string[]
  timestamp: number
}
