import type { ModuleQueries } from '@xyo-network/module-model'

import type { WitnessObserveQuery } from './Observe.ts'

export * from './Observe.ts'

export type WitnessQueries = WitnessObserveQuery
export type WitnessModuleQueries = ModuleQueries | WitnessQueries
