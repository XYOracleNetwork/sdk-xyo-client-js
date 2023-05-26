import { IndexDescription } from 'mongodb'

import { COLLECTIONS } from '../../../../collections'

export const IX_schema__timestamp: IndexDescription = {
  // eslint-disable-next-line sort-keys-fix/sort-keys-fix
  key: { schema: 1, _timestamp: -1 },
  name: `${COLLECTIONS.Payloads}.IX_schema__timestamp`,
}
