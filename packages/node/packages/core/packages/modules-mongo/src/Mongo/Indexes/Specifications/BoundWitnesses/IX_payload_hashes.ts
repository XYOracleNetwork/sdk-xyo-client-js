import { IndexDescription } from 'mongodb'

export const IX_payload_hashes: IndexDescription = {
  // eslint-disable-next-line sort-keys-fix/sort-keys-fix
  key: { payload_hashes: 1 },
  name: 'bound_witnesses.IX_payload_hashes',
}
