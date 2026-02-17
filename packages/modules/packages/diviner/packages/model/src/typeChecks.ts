import type { TypeCheck } from '@xylabs/sdk-js'
import { AsObjectFactory } from '@xylabs/sdk-js'
import {
  // eslint-disable-next-line sonarjs/deprecation
  IsInstanceFactory, isModuleInstance, IsQueryableModuleFactory, WithFactory,
} from '@xyo-network/module-model'

import type { DivinerInstance } from './Instance.ts'
import type { DivinerModule } from './Module.ts'
import { DivinerDivineQuerySchema } from './Queries/index.ts'

export const isDivinerInstance: TypeCheck<DivinerInstance> = new IsInstanceFactory<DivinerInstance>().create({ divine: 'function' }, [isModuleInstance])
export const isDivinerModule: TypeCheck<DivinerModule> = new IsQueryableModuleFactory<DivinerModule>().create([DivinerDivineQuerySchema])

export const asDivinerModule = AsObjectFactory.create(isDivinerModule)
export const asDivinerInstance = AsObjectFactory.create(isDivinerInstance)

/** @deprecated use narrowing instead [ if(is) ] */
// eslint-disable-next-line sonarjs/deprecation, @typescript-eslint/no-deprecated
export const withDivinerModule = WithFactory.create(isDivinerModule)
/** @deprecated use narrowing instead [ if(is) ] */
// eslint-disable-next-line sonarjs/deprecation, @typescript-eslint/no-deprecated
export const withDivinerInstance = WithFactory.create(isDivinerInstance)
