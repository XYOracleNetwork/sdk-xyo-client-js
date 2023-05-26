import { IndexDescription } from 'mongodb'

import { COLLECTIONS } from '../../../../collections'

export const IX__hash: IndexDescription = {
  // eslint-disable-next-line sort-keys-fix/sort-keys-fix
  key: { _hash: 1 },
  name: `${COLLECTIONS.BoundWitnesses}.IX__hash`,
}
