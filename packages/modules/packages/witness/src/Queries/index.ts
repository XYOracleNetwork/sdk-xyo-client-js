import { XyoModuleQuery, XyoQuery } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'

import { XyoWitnessObserveQuery } from './Observe'

export * from './Observe'

export type XyoWitnessQueryBase<TTarget extends XyoPayload = XyoPayload> = XyoWitnessObserveQuery<TTarget>

export type XyoWitnessQuery<TTarget extends XyoPayload = XyoPayload, TQuery extends XyoQuery | void = void> = TQuery extends XyoQuery
  ? XyoModuleQuery<XyoWitnessQueryBase<TTarget> | TQuery>
  : XyoModuleQuery<XyoWitnessQueryBase<TTarget>>

export type XyoWitnessQuerySchema = XyoWitnessQuery['schema']
