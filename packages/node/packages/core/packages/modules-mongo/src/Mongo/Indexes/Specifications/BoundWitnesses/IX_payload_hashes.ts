import { IndexDescription } from 'mongodb'

export const UX_archive: IndexDescription = {
  key: { payload_hashes: 1 },
  name: 'bound_witnesses.IX_payload_hashes',
}
