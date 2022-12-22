import { assertEx } from '@xylabs/assert'
import { XyoPayload } from '@xyo-network/payload-model'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { XyoArchivistPayloadMongoSdk } from '@xyo-network/storage'

import { COLLECTIONS } from '../collections'
import { getMongoDBConfig } from './getMongoDBConfig'

export const getArchivistPayloadMongoSdk = (archive: string) => {
  const env = getMongoDBConfig()

  return new XyoArchivistPayloadMongoSdk(
    {
      collection: COLLECTIONS.Payloads,
      dbConnectionString: env.MONGO_CONNECTION_STRING,
      dbDomain: assertEx(env.MONGO_DOMAIN, 'Missing Mongo Domain'),
      dbName: assertEx(env.MONGO_DATABASE, 'Missing Mongo Database'),
      dbPassword: assertEx(env.MONGO_PASSWORD, 'Missing Mongo Password'),
      dbUserName: assertEx(env.MONGO_USERNAME, 'Missing Mongo Username'),
    },
    archive,
  )
}

export const getArchivistAllPayloadMongoSdk = () => {
  const env = getMongoDBConfig()

  return new BaseMongoSdk<XyoPayload>({
    collection: COLLECTIONS.Payloads,
    dbConnectionString: env.MONGO_CONNECTION_STRING,
    dbDomain: assertEx(env.MONGO_DOMAIN, 'Missing Mongo Domain'),
    dbName: assertEx(env.MONGO_DATABASE, 'Missing Mongo Database'),
    dbPassword: assertEx(env.MONGO_PASSWORD, 'Missing Mongo Password'),
    dbUserName: assertEx(env.MONGO_USERNAME, 'Missing Mongo Username'),
  })
}
