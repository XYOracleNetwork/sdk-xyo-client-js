import { IndexDescription } from 'mongodb'

export const IX__hash: IndexDescription = {
  key: { _hash: 1 },
  name: 'payloads.IX__hash',
}
