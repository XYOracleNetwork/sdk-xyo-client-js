import { Account } from '@xyo-network/account'

import { getAddressSdk } from '../Mongo'
import { MongoDBPreviousHashStore } from './MongoDBPreviousHashStore'

export const addPreviousHashStore = () => {
  const sdk = getAddressSdk()
  const store = new MongoDBPreviousHashStore(sdk)
  Account.previousHashStore = store
}
