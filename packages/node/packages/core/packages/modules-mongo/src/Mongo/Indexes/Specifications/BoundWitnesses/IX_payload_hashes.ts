import { IndexDescription } from 'mongodb'

export const IX_payload_hashes: IndexDescription = {
  key: { payload_hashes: 1 },
  name: 'bound_witnesses.IX_payload_hashes',
}
