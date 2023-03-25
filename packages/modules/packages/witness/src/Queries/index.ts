import { ModuleQuery, Query } from '@xyo-network/module-model'

import { WitnessObserveQuery } from './Observe'

export * from './Observe'

export type WitnessQueryBase = WitnessObserveQuery

export type WitnessQuery<TQuery extends Query | void = void> = ModuleQuery<TQuery extends Query ? WitnessQueryBase | TQuery : WitnessQueryBase>
