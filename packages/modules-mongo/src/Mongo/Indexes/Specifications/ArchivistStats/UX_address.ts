import { IndexDescription } from 'mongodb'

import { COLLECTIONS } from '../../../../collections'

export const UX_address: IndexDescription = {
  // eslint-disable-next-line sort-keys-fix/sort-keys-fix
  key: { address: 1 },
  name: `${COLLECTIONS.ArchivistStats}.UX_address`,
  unique: true,
}
