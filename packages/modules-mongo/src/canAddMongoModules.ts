import { hasMongoDBConfig } from '@xyo-network/module-abstract-mongodb'

export const canAddMongoModules = (): boolean => {
  return hasMongoDBConfig()
}
