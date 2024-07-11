import { ModuleQueries } from '@xyo-network/module-model'

import { WitnessObserveQuery } from './Observe.js'

export * from './Observe.js'

export type WitnessQueries = WitnessObserveQuery
export type WitnessModuleQueries = ModuleQueries | WitnessQueries
