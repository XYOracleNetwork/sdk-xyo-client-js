import { IndexDescription } from 'mongodb'

export const IX__archive_payload_hashes: IndexDescription = {
  // eslint-disable-next-line sort-keys-fix/sort-keys-fix
  key: { _archive: 1, payload_hashes: 1 },
  name: 'bound_witnesses.IX__archive_payload_hashes',
}
