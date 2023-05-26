import { IndexDescription } from 'mongodb'

import { COLLECTIONS } from '../../../../collections'

export const IX_addresses: IndexDescription = {
  // eslint-disable-next-line sort-keys-fix/sort-keys-fix
  key: { addresses: 1 },
  name: `${COLLECTIONS.BoundWitnesses}.IX_addresses`,
}
