import { IndexDescription } from 'mongodb'

export const IX__hash: IndexDescription = {
  // eslint-disable-next-line sort-keys-fix/sort-keys-fix
  key: { _hash: 1 },
  name: 'payloads.IX__hash',
}
