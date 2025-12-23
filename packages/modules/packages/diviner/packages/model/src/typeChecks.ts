import type { TypeCheck } from '@xylabs/sdk-js'
import { AsObjectFactory } from '@xylabs/sdk-js'
import {
  IsInstanceFactory, IsModuleFactory, isModuleInstance, WithFactory,
} from '@xyo-network/module-model'

import type { DivinerInstance } from './Instance.ts'
import type { DivinerModule } from './Module.ts'
import { DivinerDivineQuerySchema } from './Queries/index.ts'

export const isDivinerInstance: TypeCheck<DivinerInstance> = new IsInstanceFactory<DivinerInstance>().create({ divine: 'function' }, [isModuleInstance])
export const isDivinerModule: TypeCheck<DivinerModule> = new IsModuleFactory<DivinerModule>().create([DivinerDivineQuerySchema])

export const asDivinerModule = AsObjectFactory.create(isDivinerModule)
export const asDivinerInstance = AsObjectFactory.create(isDivinerInstance)
export const withDivinerModule = WithFactory.create(isDivinerModule)
export const withDivinerInstance = WithFactory.create(isDivinerInstance)
