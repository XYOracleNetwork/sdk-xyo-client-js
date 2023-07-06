import { WithFactory } from '@xyo-network/module-model'

import { isSentinelInstance } from './isSentinelInstance'
import { isSentinelModule } from './isSentinelModule'

export const withSentinelInstance = WithFactory.create(isSentinelInstance)
export const withSentinelModule = WithFactory.create(isSentinelModule)
