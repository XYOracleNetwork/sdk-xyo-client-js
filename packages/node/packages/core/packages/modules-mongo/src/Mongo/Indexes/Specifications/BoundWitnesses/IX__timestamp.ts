import { IndexDescription } from 'mongodb'

export const IX__timestamp: IndexDescription = {
  key: { _timestamp: 1 },
  name: 'bound_witnesses.IX__timestamp',
}
