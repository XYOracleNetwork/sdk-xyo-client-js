import { IndexDescription } from 'mongodb'

export const IX__hash: IndexDescription = {
  key: { _hash: 1 },
  name: 'bound_witnesses.IX__hash',
}
