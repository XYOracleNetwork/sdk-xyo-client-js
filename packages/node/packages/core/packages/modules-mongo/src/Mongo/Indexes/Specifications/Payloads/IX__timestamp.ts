import { IndexDescription } from 'mongodb'

export const IX__timestamp: IndexDescription = {
  key: { _timestamp: 1 },
  name: 'payloads.IX__timestamp',
}
