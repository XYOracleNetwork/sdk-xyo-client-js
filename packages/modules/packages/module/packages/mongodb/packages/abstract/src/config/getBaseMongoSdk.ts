import { assertEx } from '@xylabs/assert'
import type { BaseMongoSdkPrivateConfig } from '@xylabs/mongo'
import { BaseMongoSdk } from '@xylabs/mongo'
import type { Document } from 'mongodb'

import { getMongoDBConfig } from './getMongoDBConfig.ts'

export const getBaseMongoSdkPrivateConfig = (): BaseMongoSdkPrivateConfig => {
  const env = getMongoDBConfig()
  return {
    dbConnectionString: env.MONGO_CONNECTION_STRING,
    dbDomain: assertEx(env.MONGO_DOMAIN, () => 'Missing Mongo Domain'),
    dbName: assertEx(env.MONGO_DATABASE, () => 'Missing Mongo Database'),
    dbPassword: assertEx(env.MONGO_PASSWORD, () => 'Missing Mongo Password'),
    dbUserName: assertEx(env.MONGO_USERNAME, () => 'Missing Mongo Username'),
  }
}

export const getBaseMongoSdk = <T extends Document>(collection: string) => {
  return new BaseMongoSdk<T>({ ...getBaseMongoSdkPrivateConfig(), collection })
}
