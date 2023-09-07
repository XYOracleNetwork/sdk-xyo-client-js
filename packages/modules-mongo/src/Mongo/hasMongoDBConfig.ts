import { exists } from '@xylabs/exists'

import { getMongoDBConfig } from './getMongoDBConfig'

export const hasMongoDBConfig = (): boolean => {
  const env = getMongoDBConfig()
  const requiredValues = [env.MONGO_CONNECTION_STRING, env.MONGO_DATABASE, env.MONGO_DOMAIN, env.MONGO_PASSWORD, env.MONGO_USERNAME]
  return requiredValues.every(exists)
}
