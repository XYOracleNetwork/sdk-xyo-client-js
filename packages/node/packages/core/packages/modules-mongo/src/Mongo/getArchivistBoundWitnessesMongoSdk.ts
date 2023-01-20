import { assertEx } from '@xylabs/assert'
import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { XyoArchivistBoundWitnessMongoSdk } from '@xyo-network/storage'

import { COLLECTIONS } from '../collections'
import { getMongoDBConfig } from './getMongoDBConfig'

export const getArchivistBoundWitnessesMongoSdk = (archive: string) => {
  const env = getMongoDBConfig()
  return new XyoArchivistBoundWitnessMongoSdk(
    {
      collection: COLLECTIONS.BoundWitnesses,
      dbConnectionString: env.MONGO_CONNECTION_STRING,
      dbDomain: assertEx(env.MONGO_DOMAIN, 'Missing Mongo Domain'),
      dbName: assertEx(env.MONGO_DATABASE, 'Missing Mongo Database'),
      dbPassword: assertEx(env.MONGO_PASSWORD, 'Missing Mongo Password'),
      dbUserName: assertEx(env.MONGO_USERNAME, 'Missing Mongo Username'),
    },
    archive,
  )
}

export const getArchivistAllBoundWitnessesMongoSdk = () => {
  const env = getMongoDBConfig()
  return new BaseMongoSdk<XyoBoundWitness>({
    collection: COLLECTIONS.BoundWitnesses,
    dbConnectionString: env.MONGO_CONNECTION_STRING,
    dbDomain: assertEx(env.MONGO_DOMAIN, 'Missing Mongo Domain'),
    dbName: assertEx(env.MONGO_DATABASE, 'Missing Mongo Database'),
    dbPassword: assertEx(env.MONGO_PASSWORD, 'Missing Mongo Password'),
    dbUserName: assertEx(env.MONGO_USERNAME, 'Missing Mongo Username'),
  })
}
