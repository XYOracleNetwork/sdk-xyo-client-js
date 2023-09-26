import { Account } from '@xyo-network/account'
import { COLLECTIONS, getBaseMongoSdk } from '@xyo-network/module-abstract-mongodb'

import { AddressInfo } from '../Mongo'
import { MongoDBPreviousHashStore } from './MongoDBPreviousHashStore'

export const addPreviousHashStore = () => {
  if (process.env.STORE_PREVIOUS_HASH) {
    const store = new MongoDBPreviousHashStore(getBaseMongoSdk<AddressInfo>(COLLECTIONS.AddressInfo))
    Account.previousHashStore = store
  }
}
