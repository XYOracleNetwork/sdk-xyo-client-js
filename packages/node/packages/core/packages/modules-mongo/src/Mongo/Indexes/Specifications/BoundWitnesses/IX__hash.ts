import { IndexDescription } from 'mongodb'

export const UX_archive: IndexDescription = {
  key: { _hash: 1 },
  name: 'bound_witnesses.IX__hash',
}
