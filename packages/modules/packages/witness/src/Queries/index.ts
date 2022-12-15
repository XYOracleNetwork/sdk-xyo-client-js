import { AbstractModuleQuery, XyoQuery } from '@xyo-network/module'

import { XyoWitnessObserveQuery } from './Observe'

export * from './Observe'

export type XyoWitnessQueryBase = XyoWitnessObserveQuery

export type XyoWitnessQuery<TQuery extends XyoQuery | void = void> = AbstractModuleQuery<
  TQuery extends XyoQuery ? XyoWitnessQueryBase | TQuery : XyoWitnessQueryBase
>
