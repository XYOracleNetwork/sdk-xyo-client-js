import { WithFactory } from '@xyo-network/module-model'

import { isWitnessInstance } from './isWitnessInstance'
import { isWitnessModule } from './isWitnessModule'

export const withWitnessInstance = WithFactory.create(isWitnessInstance)
export const withWitnessModule = WithFactory.create(isWitnessModule)
