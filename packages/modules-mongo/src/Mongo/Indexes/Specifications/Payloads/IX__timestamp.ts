import { COLLECTIONS } from '@xyo-network/module-abstract-mongodb'
import { IndexDescription } from 'mongodb'

export const IX__timestamp: IndexDescription = {
  // eslint-disable-next-line sort-keys-fix/sort-keys-fix
  key: { _timestamp: 1 },
  name: `${COLLECTIONS.Payloads}.IX__timestamp`,
}
