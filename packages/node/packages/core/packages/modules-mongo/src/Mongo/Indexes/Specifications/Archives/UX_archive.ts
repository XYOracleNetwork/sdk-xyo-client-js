import { IndexDescription } from 'mongodb'

export const UX_archive: IndexDescription = {
  // eslint-disable-next-line sort-keys-fix/sort-keys-fix
  key: { archive: 1 },
  name: 'archives.UX_archive',
  unique: true,
}
