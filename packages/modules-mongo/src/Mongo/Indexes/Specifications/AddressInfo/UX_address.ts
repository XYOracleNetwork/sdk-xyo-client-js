import { COLLECTIONS } from '@xyo-network/module-abstract-mongodb'
import { IndexDescription } from 'mongodb'

export const UX_address: IndexDescription = {
  // eslint-disable-next-line sort-keys-fix/sort-keys-fix
  key: { address: 1 },
  name: `${COLLECTIONS.AddressInfo}.UX_address`,
  unique: true,
}
