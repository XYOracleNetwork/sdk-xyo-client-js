import { WithModuleFactory } from '@xyo-network/module-model'

import { isSentinelModule } from './isSentinelModule'

export const withSentinelModule = WithModuleFactory.create(isSentinelModule)
