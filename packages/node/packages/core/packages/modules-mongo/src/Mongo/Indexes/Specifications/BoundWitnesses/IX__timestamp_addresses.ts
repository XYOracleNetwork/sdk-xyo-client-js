import { IndexDescription } from 'mongodb'

import { COLLECTIONS } from '../../../../collections'

export const IX__timestamp_addresses: IndexDescription = {
  // eslint-disable-next-line sort-keys-fix/sort-keys-fix
  key: { _timestamp: -1, addresses: 1 },
  name: `${COLLECTIONS.BoundWitnesses}.IX__timestamp_addresses`,
}
