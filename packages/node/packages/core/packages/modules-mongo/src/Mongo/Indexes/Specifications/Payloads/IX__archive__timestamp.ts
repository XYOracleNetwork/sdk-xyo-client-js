import { IndexDescription } from 'mongodb'

export const IX__archive__timestamp: IndexDescription = {
  key: { _archive: 1, _timestamp: 1 },
  name: 'payloads.IX__archive__timestamp',
}
