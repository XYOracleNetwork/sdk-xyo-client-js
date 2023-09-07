import { IndexDescription } from 'mongodb'

import { COLLECTIONS } from '../../../../collections'

export const IX_payload_hashes: IndexDescription = {
  // eslint-disable-next-line sort-keys-fix/sort-keys-fix
  key: { payload_hashes: 1 },
  name: `${COLLECTIONS.BoundWitnesses}.IX_payload_hashes`,
}
