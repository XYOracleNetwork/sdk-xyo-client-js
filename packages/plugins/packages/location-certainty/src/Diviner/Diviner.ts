import { AbstractDiviner } from '@xyo-network/diviner'
import {
  XyoLocationElevationPayload,
  XyoLocationElevationWitness,
  XyoLocationElevationWitnessConfigSchema,
} from '@xyo-network/elevation-payload-plugin'
import { LocationPayload, LocationSchema } from '@xyo-network/location-payload-plugin'
import { XyoModuleParams } from '@xyo-network/module'
import { XyoPayloadBuilder, XyoPayloads } from '@xyo-network/payload'
import { Job, JobProvider } from '@xyo-network/shared'

import { LocationCertaintyHeuristic, LocationCertaintyPayload } from '../Payload'
import { LocationCertaintySchema } from '../Schema'
import { LocationCertaintyDivinerConfig, LocationCertaintyDivinerConfigSchema } from './Config'

export class LocationCertaintyDiviner extends AbstractDiviner<LocationCertaintyDivinerConfig> implements LocationCertaintyDiviner, JobProvider {
  static override configSchema = LocationCertaintyDivinerConfigSchema
  static override targetSchema = LocationCertaintySchema

  get jobs(): Job[] {
    return [
      {
        name: 'LocationCertaintyDiviner.DivineElevationBatch',
        schedule: '10 minute',
        task: async () => await this.divineElevationBatch(),
      },
    ]
  }

  static override async create(params?: XyoModuleParams<LocationCertaintyDivinerConfig>) {
    return (await super.create(params)) as LocationCertaintyDiviner
  }

  /* Given an array of numbers, find the min/max/mean */
  private static calcHeuristic(heuristic: (number | null)[]): LocationCertaintyHeuristic {
    return {
      max: heuristic.reduce<number>((prev, value) => {
        return value !== null ? (value > prev ? value : prev) : prev
      }, -Infinity),
      mean: (() => {
        const values = heuristic.reduce<number[]>(
          (prev, value) => {
            return value !== null ? [value + prev[0], prev[1] + 1] : prev
          },
          [0, 0],
        )
        return values[0] / values[1]
      })(),
      min: heuristic.reduce<number>((prev, value) => {
        return value !== null ? (value < prev ? value : prev) : prev
      }, Infinity),
    }
  }

  /* Given elevation and location payloads, generate heuristic arrays */
  private static locationsToHeuristics(elevations: XyoLocationElevationPayload[], locations: LocationPayload[]) {
    const heuristics = elevations.reduce<{ altitude: (number | null)[]; elevation: number[]; variance: (number | null)[] }>(
      (prev, elev, index) => {
        const elevation = elev.elevation
        if (elevation === undefined || elevation === null) {
          throw Error('Invalid Elevation')
        }
        const altitude = locations[index].altitude
        prev.altitude.push(altitude ?? null)
        prev.elevation.push(elevation)
        prev.variance.push(altitude !== undefined && altitude !== null ? altitude - elevation : null)
        return prev
      },
      { altitude: [], elevation: [], variance: [] },
    )
    return heuristics
  }

  /** @description Given a set of locations, get the expected elevations (witness if needed), and return score/variance */
  public async divine(payloads?: XyoPayloads): Promise<XyoPayloads> {
    const locations = payloads?.filter<LocationPayload>((payload): payload is LocationPayload => payload?.schema === LocationSchema)
    // If this is a query we support
    if (locations && locations?.length > 0) {
      const elevationWitness = await XyoLocationElevationWitness.create({
        config: {
          locations,
          schema: XyoLocationElevationWitnessConfigSchema,
        },
      })
      const elevations = (await elevationWitness.observe()) as XyoLocationElevationPayload[]

      const heuristics = LocationCertaintyDiviner.locationsToHeuristics(elevations, locations)

      const result = new XyoPayloadBuilder<LocationCertaintyPayload>({ schema: LocationCertaintySchema })
        .fields({
          altitude: LocationCertaintyDiviner.calcHeuristic(heuristics.altitude),
          elevation: LocationCertaintyDiviner.calcHeuristic(heuristics.elevation),
          variance: LocationCertaintyDiviner.calcHeuristic(heuristics.variance),
        })
        .build()

      this.logger?.log('LocationCertaintyDiviner.Divine: Processed query')
      return [result]
    }
    return []
  }

  /** @description Is the goal here to prime/index the diviner? */
  private divineElevationBatch = async () => {
    this.logger?.log('LocationCertaintyDiviner.DivineElevationBatch: Divining elevations for batch')
    // TODO: Any background/batch processing here
    await Promise.resolve()
    this.logger?.log('LocationCertaintyDiviner.DivineElevationBatch: Divined elevations for batch')
  }
}
