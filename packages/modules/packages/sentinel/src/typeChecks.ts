import { AsFactory, IsInstanceFactory, IsModuleFactory, isModuleInstance, WithFactory } from '@xyo-network/module-model'

import { SentinelReportQuerySchema } from './Queries'
import { SentinelInstance, SentinelModule } from './SentinelModel'

export const isSentinelInstance = IsInstanceFactory.create<SentinelInstance>({ report: 'function' }, isModuleInstance)
export const isSentinelModule = IsModuleFactory.create<SentinelModule>([SentinelReportQuerySchema])

export const asSentinelModule = AsFactory.create(isSentinelModule)
export const asSentinelInstance = AsFactory.create(isSentinelInstance)
export const withSentinelModule = WithFactory.create(isSentinelModule)
export const withSentinelInstance = WithFactory.create(isSentinelInstance)
