import { AbstractDiviner, DivinerConfig } from '@xyo-network/diviner'
import { Query } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

export type LocationCertaintySchema = 'network.xyo.location.certainty'
export const LocationCertaintySchema: LocationCertaintySchema = 'network.xyo.location.certainty'

export type LocationCertaintyDivinerConfigSchema = 'network.xyo.location.elevation.diviner.config'
export const LocationCertaintyDivinerConfigSchema: LocationCertaintyDivinerConfigSchema = 'network.xyo.location.elevation.diviner.config'

export type LocationCertaintyDivinerConfig<S extends string = string, T extends Payload = Payload> = DivinerConfig<
  T & {
    schema: S
  }
>

export interface LocationCertaintyHeuristic {
  max: number
  mean: number
  min: number
}

export type LocationCertaintyPayload = Query<{
  altitude: LocationCertaintyHeuristic
  /** @field Value between 0 and 100 - Certainty Score */
  certainty: number
  elevation: LocationCertaintyHeuristic
  schema: LocationCertaintySchema
  variance: LocationCertaintyHeuristic
}>

export const isLocationCertaintyPayload = (x?: Payload | null): x is LocationCertaintyPayload => x?.schema === LocationCertaintySchema

export type LocationCertaintyDiviner = AbstractDiviner
