import { IndexDescription } from 'mongodb'

export const IX_addresses_payload_schemas: IndexDescription = {
  // eslint-disable-next-line sort-keys-fix/sort-keys-fix
  key: { addresses: 1, payload_schemas: 1 },
  name: 'bound_witnesses.IX_addresses_payload_schemas',
}
