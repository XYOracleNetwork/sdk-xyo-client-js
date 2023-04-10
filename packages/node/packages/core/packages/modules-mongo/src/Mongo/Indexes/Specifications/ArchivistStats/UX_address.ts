import { IndexDescription } from 'mongodb'

export const UX_address: IndexDescription = {
  // eslint-disable-next-line sort-keys-fix/sort-keys-fix
  key: { address: 1 },
  name: 'archivist_stats.UX_address',
  unique: true,
}
