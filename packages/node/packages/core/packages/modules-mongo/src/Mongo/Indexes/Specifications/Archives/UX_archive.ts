import { IndexDescription } from 'mongodb'

export const UX_archive: IndexDescription = {
  key: { archive: 1 },
  name: 'archives.UX_archive',
  unique: true,
}
