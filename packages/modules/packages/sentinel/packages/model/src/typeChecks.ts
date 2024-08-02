import { AsObjectFactory } from '@xylabs/object'
import { IsInstanceFactory, IsModuleFactory, isModuleInstance, WithFactory } from '@xyo-network/module-model'

import { SentinelInstance } from './Instance.ts'
import { SentinelModule } from './Module.ts'
import { SentinelReportQuerySchema } from './Queries/index.ts'

export const isSentinelInstance = new IsInstanceFactory<SentinelInstance>().create({ report: 'function' }, [isModuleInstance])
export const isSentinelModule = new IsModuleFactory<SentinelModule>().create([SentinelReportQuerySchema])

export const asSentinelModule = AsObjectFactory.create(isSentinelModule)
export const asSentinelInstance = AsObjectFactory.create(isSentinelInstance)
export const withSentinelModule = WithFactory.create(isSentinelModule)
export const withSentinelInstance = WithFactory.create(isSentinelInstance)
