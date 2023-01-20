import { SortDirection } from '../../sortDirection'

export interface PayloadSearchCriteria {
  addresses: string[]
  archives: string[]
  direction: SortDirection
  schemas: string[]
  timestamp: number
}
