import { ModuleQuery, XyoQuery } from '@xyo-network/module-model'

import { XyoWitnessObserveQuery } from './Observe'

export * from './Observe'

export type XyoWitnessQueryBase = XyoWitnessObserveQuery

export type XyoWitnessQuery<TQuery extends XyoQuery | void = void> = ModuleQuery<
  TQuery extends XyoQuery ? XyoWitnessQueryBase | TQuery : XyoWitnessQueryBase
>
