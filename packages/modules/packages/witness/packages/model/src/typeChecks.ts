import type { TypeCheck } from '@xylabs/sdk-js'
import { AsObjectFactory } from '@xylabs/sdk-js'
import {
  // eslint-disable-next-line sonarjs/deprecation
  IsInstanceFactory, isModuleInstance, IsQueryableModuleFactory, WithFactory,
} from '@xyo-network/module-model'

import type { WitnessInstance } from './Instance.ts'
import type { WitnessModule } from './Module.ts'
import { WitnessObserveQuerySchema } from './Queries/index.ts'

export const isWitnessInstance: TypeCheck<WitnessInstance> = new IsInstanceFactory<WitnessInstance>().create({ observe: 'function' }, [isModuleInstance])
export const isWitnessModule: TypeCheck<WitnessModule> = new IsQueryableModuleFactory<WitnessModule>().create([WitnessObserveQuerySchema])

export const asWitnessModule = AsObjectFactory.create(isWitnessModule)
export const asWitnessInstance = AsObjectFactory.create(isWitnessInstance)

/** @deprecated use narrowing instead [ if(is) ] */
// eslint-disable-next-line sonarjs/deprecation, @typescript-eslint/no-deprecated
export const withWitnessModule = WithFactory.create(isWitnessModule)

/** @deprecated use narrowing instead [ if(is) ] */
// eslint-disable-next-line sonarjs/deprecation, @typescript-eslint/no-deprecated
export const withWitnessInstance = WithFactory.create(isWitnessInstance)
