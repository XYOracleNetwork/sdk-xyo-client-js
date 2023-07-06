import { WithModuleFactory } from '@xyo-network/module-model'

import { isWitnessModule } from './isWitnessModule'

export const withWitnessModule = WithModuleFactory.create(isWitnessModule)
