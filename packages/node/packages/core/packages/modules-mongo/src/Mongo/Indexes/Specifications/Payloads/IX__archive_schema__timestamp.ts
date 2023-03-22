import { IndexDescription } from 'mongodb'

export const IX__archive_schema__timestamp: IndexDescription = {
  // eslint-disable-next-line sort-keys-fix/sort-keys-fix
  key: { _archive: 1, schema: 1, _timestamp: 1 },
  name: 'payloads.IX__archive_schema__timestamp',
}
