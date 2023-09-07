import { hasMongoDBConfig } from './Mongo'

export const canAddMongoModules = (): boolean => {
  return hasMongoDBConfig()
}
