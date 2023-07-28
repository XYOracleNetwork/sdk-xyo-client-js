import { IsInstanceFactory, IsModuleFactory, isModuleInstance, WithFactory } from '@xyo-network/module-model'
import { AsObjectFactory } from '@xyo-network/object-identity'

import { SentinelInstance, SentinelModule, SentinelReportQuerySchema } from './model'

export const isSentinelInstance = new IsInstanceFactory<SentinelInstance>().create({ report: 'function' }, [isModuleInstance])
export const isSentinelModule = new IsModuleFactory<SentinelModule>().create([SentinelReportQuerySchema])

export const asSentinelModule = AsObjectFactory.create(isSentinelModule)
export const asSentinelInstance = AsObjectFactory.create(isSentinelInstance)
export const withSentinelModule = WithFactory.create(isSentinelModule)
export const withSentinelInstance = WithFactory.create(isSentinelInstance)
