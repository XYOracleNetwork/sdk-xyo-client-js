import { ModuleQueries } from '@xyo-network/module-model'

import { WitnessObserveQuery } from './Observe.ts'

export * from './Observe.ts'

export type WitnessQueries = WitnessObserveQuery
export type WitnessModuleQueries = ModuleQueries | WitnessQueries
