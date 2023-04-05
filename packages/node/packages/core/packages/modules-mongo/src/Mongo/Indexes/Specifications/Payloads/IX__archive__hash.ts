import { IndexDescription } from 'mongodb'

export const IX__archive__hash: IndexDescription = {
  key: { _archive: 1, _hash: 1 },
  name: 'payloads.IX__archive__hash',
}
