import { IndexDescription } from 'mongodb'

export const UX_archive: IndexDescription = {
  key: { _archive: 1, _timestamp: 1 },
  name: 'bound_witnesses.IX__archive__timestamp',
}
