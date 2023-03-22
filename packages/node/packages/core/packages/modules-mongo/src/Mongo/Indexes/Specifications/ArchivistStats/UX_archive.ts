import { IndexDescription } from 'mongodb'

export const UX_archive: IndexDescription = {
  key: { archive: 1 },
  name: 'archivist_stats.UX_archive',
  unique: true,
}
