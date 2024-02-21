import { ModuleQueries } from '@xyo-network/module-model'

import { WitnessObserveQuery } from './Observe'

export * from './Observe'

export type WitnessQueries = WitnessObserveQuery
export type WitnessModuleQueries = ModuleQueries | WitnessQueries
