import { UserManager } from '@xyo-network/node-core-model'
import { TYPES } from '@xyo-network/node-core-types'
import { ContainerModule, interfaces } from 'inversify'

import { MongoDBUserManager } from './User'

export const ManagerContainerModule = new ContainerModule((bind: interfaces.Bind) => {
  bind<UserManager>(TYPES.UserManager).to(MongoDBUserManager).inSingletonScope()
})
