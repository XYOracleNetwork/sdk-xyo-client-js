import { XyoModuleQuery, XyoModuleQuerySchema, XyoQuery } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'

import { XyoWitnessObserveQuery, XyoWitnessObserveQuerySchema } from './Observe'

export * from './Observe'

type XyoWitnessQueryBase<TTarget extends XyoPayload = XyoPayload> = XyoWitnessObserveQuery<TTarget> | XyoModuleQuery

export type XyoWitnessQuery<TTarget extends XyoPayload = XyoPayload, TQuery extends XyoQuery | void = void> = TQuery extends XyoQuery
  ? XyoWitnessQueryBase<TTarget> | TQuery
  : XyoWitnessQueryBase<TTarget>

type XyoWitnessQuerySchemaBase = XyoWitnessObserveQuerySchema | XyoModuleQuerySchema

export type XyoWitnessQuerySchema<T extends string | void = void> = T extends string ? XyoWitnessQuerySchemaBase | T : XyoWitnessQuerySchemaBase
