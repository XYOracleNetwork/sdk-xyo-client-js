import { IndexDescription } from 'mongodb'

export const UX_archive: IndexDescription = {
  key: { _timestamp: 1 },
  name: 'bound_witnesses.IX__timestamp',
}
