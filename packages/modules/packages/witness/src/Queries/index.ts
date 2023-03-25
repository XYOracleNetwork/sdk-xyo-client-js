import { ModuleQuery, Query } from '@xyo-network/module-model'

import { XyoWitnessObserveQuery } from './Observe'

export * from './Observe'

export type XyoWitnessQueryBase = XyoWitnessObserveQuery

export type XyoWitnessQuery<TQuery extends Query | void = void> = ModuleQuery<
  TQuery extends Query ? XyoWitnessQueryBase | TQuery : XyoWitnessQueryBase
>
