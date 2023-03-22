import { IndexDescription } from 'mongodb'

export const UX_archive: IndexDescription = {
  key: { _archive: 1, payload_hashes: 1 },
  name: 'bound_witnesses.IX__archive_payload_hashes',
}
