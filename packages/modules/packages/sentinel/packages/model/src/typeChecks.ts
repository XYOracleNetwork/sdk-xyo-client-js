import { AsObjectFactory } from '@xylabs/sdk-js'
import {
  // eslint-disable-next-line sonarjs/deprecation
  IsInstanceFactory, isModuleInstance, IsQueryableModuleFactory, WithFactory,
} from '@xyo-network/module-model'

import type { SentinelInstance } from './Instance.ts'
import type { SentinelModule } from './Module.ts'
import { SentinelReportQuerySchema } from './Queries/index.ts'

export const isSentinelInstance = new IsInstanceFactory<SentinelInstance>().create({ report: 'function' }, [isModuleInstance])
export const isSentinelModule = new IsQueryableModuleFactory<SentinelModule>().create([SentinelReportQuerySchema])

export const asSentinelModule = AsObjectFactory.create(isSentinelModule)
export const asSentinelInstance = AsObjectFactory.create(isSentinelInstance)

/** @deprecated use narrowing instead [ if(is) ] */
// eslint-disable-next-line sonarjs/deprecation, @typescript-eslint/no-deprecated
export const withSentinelModule = WithFactory.create(isSentinelModule)
/** @deprecated use narrowing instead [ if(is) ] */
// eslint-disable-next-line sonarjs/deprecation, @typescript-eslint/no-deprecated
export const withSentinelInstance = WithFactory.create(isSentinelInstance)
