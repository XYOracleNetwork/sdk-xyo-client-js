import { IndexDescription } from 'mongodb'

export const UX_address: IndexDescription = {
  key: { address: 1 },
  name: 'archivist_stats.UX_address',
  unique: true,
}
