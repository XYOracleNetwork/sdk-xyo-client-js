import { XyoModuleQuery, XyoQuery } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'

import { XyoWitnessObserveQuery } from './Observe'

export * from './Observe'

export type XyoWitnessQueryBase<TTarget extends XyoPayload = XyoPayload> = XyoWitnessObserveQuery<TTarget>

export type XyoWitnessQuery<TTarget extends XyoPayload = XyoPayload, TQuery extends XyoQuery | void = void> = XyoModuleQuery<
  TQuery extends XyoQuery ? XyoWitnessQueryBase<TTarget> | TQuery : XyoWitnessQueryBase<TTarget>
>
