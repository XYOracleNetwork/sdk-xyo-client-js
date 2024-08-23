import { AsObjectFactory } from '@xylabs/object'
import {
  IsInstanceFactory, IsModuleFactory, isModuleInstance, WithFactory,
} from '@xyo-network/module-model'

import type { WitnessInstance } from './Instance.ts'
import type { WitnessModule } from './Module.ts'
import { WitnessObserveQuerySchema } from './Queries/index.ts'

export const isWitnessInstance = new IsInstanceFactory<WitnessInstance>().create({ observe: 'function' }, [isModuleInstance])
export const isWitnessModule = new IsModuleFactory<WitnessModule>().create([WitnessObserveQuerySchema])

export const asWitnessModule = AsObjectFactory.create(isWitnessModule)
export const asWitnessInstance = AsObjectFactory.create(isWitnessInstance)
export const withWitnessModule = WithFactory.create(isWitnessModule)
export const withWitnessInstance = WithFactory.create(isWitnessInstance)
