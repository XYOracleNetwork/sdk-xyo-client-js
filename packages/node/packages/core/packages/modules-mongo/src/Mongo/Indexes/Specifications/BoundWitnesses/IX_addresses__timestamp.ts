import { IndexDescription } from 'mongodb'

export const IX_addresses__timestamp: IndexDescription = {
  // eslint-disable-next-line sort-keys-fix/sort-keys-fix
  key: { addresses: 1, _timestamp: -1 },
  name: 'bound_witnesses.IX_addresses__timestamp',
}
