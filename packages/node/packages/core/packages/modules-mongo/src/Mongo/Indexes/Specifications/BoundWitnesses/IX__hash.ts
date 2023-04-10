import { IndexDescription } from 'mongodb'

export const IX__hash: IndexDescription = {
  // eslint-disable-next-line sort-keys-fix/sort-keys-fix
  key: { _hash: 1 },
  name: 'bound_witnesses.IX__hash',
}
